import * as React from 'react';
import { setVirtualParent } from '@fluentui/dom-utilities';
import { DetailsList, Stack, DetailsListLayoutMode, IStackTokens, INavLinkGroup, INavLink, Nav, CommandBar, ICommandBarItemProps, DefaultButton, Selection, SelectionMode, IColumn, TooltipHost } from '@fluentui/react';
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';
import { NeutralColors, SharedColors } from '@fluentui/theme';

import DeleteStagingDialog from './Dialogs/DeleteStagingDialog';
import CreateStagingFolderDialog from './Dialogs/CreateStagingFolderDialog';
import OverrideStagingFileDialog from './Dialogs/OverrideStagingFileDialog';

import configData from "../config.json";
import { IStagingFolder, IStagingFile, StagingFileStatus } from '../models/IStaging';


const stackTokens: IStackTokens = { childrenGap: 10 };
const classNames = mergeStyleSets({
    fileIconHeaderIcon: {
        padding: 0,
        fontSize: '16px',
    },
    fileIconCell: {
        textAlign: 'center',
        selectors: {
            '&:before': {
                content: '.',
                display: 'inline-block',
                verticalAlign: 'middle',
                height: '100%',
                width: '0px',
                visibility: 'hidden',
            },
        },
    },
    fileIconImg: {
        verticalAlign: 'middle',
        maxHeight: '16px',
        maxWidth: '16px',
    },
    controlWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    exampleToggle: {
        display: 'inline-block',
        marginBottom: '10px',
        marginRight: '30px',
    },
    selectionDetails: {
        marginBottom: '20px',
    },
});

export default class StagingArea extends React.Component<any, any> {
    private _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
        const { columns, files } = this.state;
        const newColumns: IColumn[] = columns.slice();
        const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
        newColumns.forEach((newCol: IColumn) => {
            if (newCol === currColumn) {
                currColumn.isSortedDescending = !currColumn.isSortedDescending;
                currColumn.isSorted = true;
                this.setState({
                    announcedMessage: `${currColumn.name} is sorted ${currColumn.isSortedDescending ? 'descending' : 'ascending'
                        }`,
                });
            } else {
                newCol.isSorted = false;
                newCol.isSortedDescending = true;
            }
        });
        const newItems = this._copyAndSort(files, currColumn.fieldName!, currColumn.isSortedDescending);
        this.setState({
            columns: newColumns,
            files: newItems,
        });
    };

    private _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
        const key = columnKey as keyof T;
        return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
    }

    private _selection: Selection = new Selection({
        onSelectionChanged: () => {
            let uploadedDocumentsSelected = false;
            const files = Array.from(this.state.files);
            for (let selectedDocument of this._selection.getSelection()) {
                const index = files.findIndex((item: IStagingFile) => item.key === selectedDocument.key);
                if (files[index].status === StagingFileStatus.Uploaded) {
                    uploadedDocumentsSelected = true;
                }
            }
            this.setState({ uploadedDocumentsSelected: uploadedDocumentsSelected, });
        },
    });

    private selectedFolder(folderKey: string | undefined) {
        if (folderKey) {
            let files = new Array<IStagingFile>();
            const itemIndex = this.state.stagingFolder.findIndex((folder: IStagingFolder) => folder.layerPath === folderKey);
            if (itemIndex !== -1) {
                files = Array.from(this.state.stagingFolder[itemIndex].files);
            }

            this.setState({
                selectedNavKey: folderKey,
                files: files,
                addedFiles: new Array<IStagingFile>(),
            });
        }
    }

    private _columns = [
        {
            key: 'column1',
            name: 'File Type',
            className: classNames.fileIconCell,
            iconClassName: classNames.fileIconHeaderIcon,
            ariaLabel: 'Column operations for File type, Press to sort on File type',
            iconName: 'Page',
            isIconOnly: true,
            fieldName: 'name',
            minWidth: 16,
            maxWidth: 16,
            onColumnClick: this._onColumnClick,
            onRender: (item: IStagingFile) => (
                <TooltipHost content={`${item.fileType} file`}>
                    <img src={item.iconName} className={classNames.fileIconImg} alt={`${item.fileType} file icon`} />
                </TooltipHost>
            ),
        },
        {
            key: 'column2', name: 'Name', fieldName: 'name', minWidth: 200, maxWidth: 1000, isResizable: true,
            isRowHeader: true,
            isSorted: true,
            isSortedDescending: false,
            sortAscendingAriaLabel: 'Sorted A to Z',
            sortDescendingAriaLabel: 'Sorted Z to A',
            onColumnClick: this._onColumnClick,
            data: 'string',
        },
        {
            key: 'column4', name: 'Status', fieldName: 'status', minWidth: 150, maxWidth: 300, isResizable: true, data: 'string', onColumnClick: this._onColumnClick,
        },
        {
            key: 'column5', name: 'File Size', fieldName: 'fileSizeRaw', minWidth: 200, maxWidth: 700, isResizable: true, data: 'number',
            onColumnClick: this._onColumnClick,
            onRender: (item: IStagingFile) => {
                return <span>{item.fileSize}</span>;
            },
        },
        {
            key: 'column6', name: 'Modify Date', fieldName: 'lastModified', minWidth: 200, maxWidth: 700, isResizable: true,
            isPadded: true,
            data: 'number',
            onColumnClick: this._onColumnClick,
            onRender: (item: IStagingFile) => {
                return <span>{item.lastModifiedLocaleString}</span>;
            },
        },
    ];

    public state = {
        error: false,
        errorMessage: "",
        loading: false,
        files: new Array<IStagingFile>(),
        addedFiles: new Array<IStagingFile>(),
        columns: this._columns,
        uploadedDocumentsSelected: false,
        navLinkGroups: new Array<INavLinkGroup>(),
        stagingFolder: new Array<IStagingFolder>(),
        selectedNavKey: "0",
        showDeleteDialog: false,
        showCreateStagingFolderDialog: false,
        showOverrideFileDialog: false,
        deleteDialogTitle: "",
        deleteDialogText: "",
        currentFolderPath: "",
        duplicateFiles: [],
        fileList: {} as FileList,
    };

    componentDidMount() {
        this.loadFolderNavigation();
    }

    private loadFolderNavigation() {
        this.setState({
            loading: true,
            navLinkGroups: new Array<INavLinkGroup>(),
            stagingFolder: new Array<IStagingFolder>(),
            selectedNavKey: "0",
            files: new Array<IStagingFile>(),
            addedFiles: new Array<IStagingFile>(),
        });
        const navLinks: Array<INavLinkGroup> = [
            {
                links: [
                    {
                        key: "0",
                        name: "staging",
                        url: "",
                        isExpanded: true,
                        links: []
                    }
                ],
            },
        ];

        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.props.token
            }
        };

        let dataStructure = new Array<IStagingFolder>();

        fetch(configData.SERVER_URL + '/staging', requestOptions)
            .then(async response => {
                const isJson = response.headers.get('content-type')?.includes('application/json');
                const data = isJson && await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        this.props.timedOutSession();
                    }
                    else {
                        console.error(response);
                        this.setState({ loading: true, });
                    }
                } else {
                    navLinks[0].links[0].links = this.createNavigationStructure(data, "0");

                    dataStructure = this.createDataStructure(data, "", "", 0);
                    this.setState({ loading: false, navLinkGroups: navLinks, stagingFolder: dataStructure });
                }
            })
            .catch(error => {
                console.error(error);
                this.props.onErrorHappened();
                this.setState({ loading: true, });
            });
    }

    private createNavigationStructure(currentData: any, layerPath: string) {
        const result = new Array<INavLink>();

        let currentItemIndex = 0;
        for (let currentElement of currentData.children) {
            if (currentElement.type === "directory") {
                const curentLayerPath = layerPath + "-" + currentItemIndex;
                currentItemIndex = currentItemIndex + 1;
                const hasSubfolder = currentElement.children.findIndex((item: any) => item.type === "directory") > -1;
                if (hasSubfolder) {
                    result.push({
                        key: curentLayerPath,
                        name: currentElement.name,
                        url: "",
                        links: this.createNavigationStructure(currentElement, curentLayerPath)
                    });
                }
                else {
                    result.push({
                        key: curentLayerPath,
                        name: currentElement.name,
                        url: "",
                    });
                }
            }
        }
        return result;
    }

    private createDataStructure(currentData: any, path: string, layerPath: string, itemIndex: number) {
        let result = new Array<IStagingFolder>();

        const hasSubfolder = currentData.children.findIndex((item: any) => item.type === "directory") > -1;
        const hasfiles = currentData.children.findIndex((item: any) => item.type === "file") > -1;
        const curentLayerPath = layerPath === "" ? "0" : layerPath + "-" + itemIndex;
        const currentPath = currentData.name === "staging" ? "" : path + "/" + currentData.name;

        const currentFolderFiles = new Array<IStagingFile>();

        if (hasfiles) {
            const files = currentData.children.filter((item: any) => item.type === "file");

            for (let file of files) {
                const indexOfLastDot = file.name.lastIndexOf(".");
                const fileExtension = file.name.substring(indexOfLastDot + 1);
                currentFolderFiles.push({
                    key: file.name + file.size,
                    name: file.name,
                    value: file.name,
                    iconName: `https://static2.sharepointonline.com/files/fabric/assets/item-types/16/${fileExtension}.svg`,
                    fileSizeRaw: Math.round((file.size / 1024)),
                    fileSize: Math.round((file.size / 1024)) + " KB",
                    fileType: file.type,
                    fileExtension: fileExtension,
                    lastModified: file.modified * 1000,
                    lastModifiedDate: new Date(file.modified * 1000),
                    lastModifiedLocaleString: new Date(file.modified * 1000).toLocaleString(),
                    status: StagingFileStatus.Uploaded
                }
                );
            }
        }
        result.push({
            path: currentPath,
            layerPath: curentLayerPath,
            name: currentData.name,
            files: currentFolderFiles,
        });

        if (hasSubfolder) {
            const subFolders = currentData.children.filter((item: any) => item.type === "directory");

            let subFolderIndex = 0;

            for (let subFolder of subFolders) {
                const subFolderArray = this.createDataStructure(subFolder, currentPath, curentLayerPath, subFolderIndex);
                result = result.concat(subFolderArray);
                subFolderIndex = subFolderIndex + 1;
            }
        }
        return result;
    }

    private openSelectFileDialog(mouseEvent?: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) {
        Promise.resolve().then(() => {
            mouseEvent?.persist();

            // create hidden input element with type file to open the select file dialog
            const inputElement = document.createElement('input');
            inputElement.style.visibility = 'hidden';
            inputElement.setAttribute('type', 'file');
            inputElement.setAttribute('multiple', 'true');
            inputElement.setAttribute('accept', '.doc, .docx, .xlsx');
            inputElement.onchange = () => this.checkSelectedFiles(inputElement);
            // add element to the DOM
            document.body.appendChild(inputElement);
            const target = mouseEvent?.target as HTMLElement | undefined;

            if (target) {
                setVirtualParent(inputElement, target);
            }

            // add click action to show the dialog
            inputElement.click();
            if (target) {
                setVirtualParent(inputElement, null);
            }

            // delete the input element 1 sec after the dialog is closen -> the onchange event already read all the information
            setTimeout(() => {
                inputElement.remove();
            }, 10000);
        });
    }

    private checkSelectedFiles(inputElement: HTMLInputElement) {
        const fileList = inputElement.files!;
        let files = Array.from(this.state.files);
        const addedFiles = new Array<IStagingFile>();

        const duplicateFiles = [];

        for (let i = 0; i < fileList.length; i++) {

            const file = fileList.item(i)!;
            const indexOfLastDot = file.name.lastIndexOf(".");
            const fileExtension = file.name.substring(indexOfLastDot + 1);

            // dont check if this is already true => the result of the loop could be false, even if one item was found
            if (files.findIndex((existingFile: IStagingFile) => existingFile.name === file.name) > -1) {
                duplicateFiles.push(file.name);
            }

            addedFiles.push({
                key: file.name + file.size,
                name: file.name,
                value: file.name,
                iconName: `https://static2.sharepointonline.com/files/fabric/assets/item-types/16/${fileExtension}.svg`,
                fileSizeRaw: Math.round((file.size / 1024)),
                fileSize: Math.round((file.size / 1024)) + " KB",
                fileType: file.type,
                fileExtension: fileExtension,
                lastModified: file.lastModified,
                lastModifiedDate: new Date(file.lastModified),
                lastModifiedLocaleString: new Date(file.lastModified).toLocaleString(),
                status: StagingFileStatus.Uploading
            });
        }

        if (duplicateFiles.length > 0) {
            // at least one file is already existing, so the user needs to choose if the process shall be cancelled or the file shall be deleted before the new one gets uploaded
            this.setState({
                addedFiles: addedFiles,
                showOverrideFileDialog: true,
                duplicateFiles: duplicateFiles,
                fileList: fileList,
            });
        }
        else {
            files = files.concat(addedFiles);
            // all files are new, so just go ahead and upload them
            this.setState({
                addedFiles: addedFiles,
                files: files,
            });
            this.uploadSelectedFiles(fileList);
        }
    }

    private uploadSelectedFiles(fileList: FileList) {
        let path = "/";
        const itemIndex = this.state.stagingFolder.findIndex((folder: IStagingFolder) => folder.layerPath === this.state.selectedNavKey);
        if (itemIndex !== -1) {
            path = this.state.stagingFolder[itemIndex].path;
        }

        // repeat the same loop so that the files array can be updated and the user sees the new files in status uploading
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList.item(i)!;

            const formData = new FormData();
            formData.append("path", path);
            formData.append("file", file);

            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + this.props.token
                },
                body: formData
            };

            fetch(configData.SERVER_URL + '/staging', requestOptions)
                .then(async response => {
                    if (!response.ok) {
                        if (response.status === 401) {
                            this.props.timedOutSession();
                        }
                        else {
                            console.error(response);
                            this.setState({ loading: true, });
                        }
                    } else {
                        const files = Array.from(this.state.files);
                        const index = files.findIndex((item: IStagingFile) => item.key === file.name + file.size);
                        files[index].status = StagingFileStatus.Uploaded;

                        const stagingFolder = Array.from(this.state.stagingFolder);
                        stagingFolder[itemIndex].files.push(files[index])

                        this.setState({ files: files, stagingFolder: stagingFolder, addedFiles: new Array<IStagingFile>(), fileList: {} as FileList, });
                    }
                })
                .catch(error => {
                    console.error(error);
                    this.props.onErrorHappened();

                    const files = Array.from(this.state.files);
                    const index = files.findIndex((item: IStagingFile) => item.key === file.name + file.size);
                    files[index].status = StagingFileStatus.UploadFailed;

                    this.setState({ loading: false, files: files, });
                });
        }
    }

    private successfulCalls = 0;
    private totalCalls = 0;
    private callWithError = false;

    private async deleteDuplicates() {
        let files = Array.from(this.state.files);
        const stagingFolder = Array.from(this.state.stagingFolder);
        const folderIndex = stagingFolder.findIndex((folder: IStagingFolder) => folder.layerPath === this.state.selectedNavKey);
        const folderPath = stagingFolder[folderIndex].path.substring(1); // don't take first / the backend will throw an error

        this.successfulCalls = 0;
        this.callWithError = false;
        this.totalCalls = this.state.duplicateFiles.length;
        for (let duplicateFile of this.state.duplicateFiles) {
            let fileIndex = files.findIndex((item: IStagingFile) => item.name === duplicateFile);

            const requestOptions = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.props.token
                }
            };

            const filePath = folderPath + "/" + files[fileIndex].name;

            fetch(configData.SERVER_URL + '/staging?path=' + filePath, requestOptions)
                .then(async response => {
                    if (!response.ok) {
                        if (response.status === 401) {
                            this.props.timedOutSession();
                        }
                        else {
                            console.error(response);
                            this.setState({ loading: true, });
                        }
                    } else {
                        fileIndex = files.findIndex((item: IStagingFile) => item.name === duplicateFile); // get index again, it could have changes because of a parallel async fetch in this loop (slice action is changing the array)
                        const fileIndexInStagingFolder = stagingFolder[folderIndex].files.findIndex((item: IStagingFile) => item.key === files[fileIndex].key);

                        files.splice(fileIndex, 1);
                        stagingFolder[folderIndex].files.splice(fileIndexInStagingFolder, 1);

                        this.successfulCalls = this.successfulCalls + 1;
                    }
                })
                .catch(error => {
                    console.error(error);
                    this.callWithError = true;
                    this.props.onErrorHappened();
                    this.setState({ loading: true, });
                });
        }

        const waitedSuccesful = await this.waitForAllCalls();

        if (waitedSuccesful) {
            files = files.concat(this.state.addedFiles);
            this.setState(
                {
                    files: files,
                    stagingFolder: stagingFolder,
                    duplicateFiles: [],
                    showOverrideFileDialog: false,
                },
                () => this.uploadSelectedFiles(this.state.fileList)
            );
        }
    }

    private async deleteSelectedFiles() {
        const files = Array.from(this.state.files);
        const stagingFolder = Array.from(this.state.stagingFolder);
        const folderIndex = stagingFolder.findIndex((folder: IStagingFolder) => folder.layerPath === this.state.selectedNavKey);
        const folderPath = stagingFolder[folderIndex].path.substring(1); // don't take first / the backend will throw an error

        this.successfulCalls = 0;
        this.callWithError = false;
        this.totalCalls = this._selection.count;

        for (let selectedDocument of this._selection.getSelection()) {
            let fileIndex = files.findIndex((item: IStagingFile) => item.key === selectedDocument.key);

            const requestOptions = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.props.token
                }
            };

            const filePath = folderPath + "/" + files[fileIndex].name;

            fetch(configData.SERVER_URL + '/staging?path=' + filePath, requestOptions)
                .then(async response => {
                    if (!response.ok) {
                        if (response.status === 401) {
                            this.props.timedOutSession();
                        }
                        else {
                            console.error(response);
                            this.setState({ loading: true, });
                        }
                    } else {
                        fileIndex = files.findIndex((item: IStagingFile) => item.key === selectedDocument.key); // get index again, it could have changes because of a parallel fetch
                        files.splice(fileIndex, 1);

                        const fileIndexInStagingFolder = stagingFolder[folderIndex].files.findIndex((item: IStagingFile) => item.key === selectedDocument.key);
                        stagingFolder[folderIndex].files.splice(fileIndexInStagingFolder, 1);

                    }
                    this.successfulCalls = this.successfulCalls + 1;
                })
                .catch(error => {
                    console.error(error);
                    this.callWithError = true;
                    this.props.onErrorHappened();
                    this.setState({ loading: true, });
                });
        }

        const waitedSuccesful = await this.waitForAllCalls();

        if (waitedSuccesful) {
            this.setState({ files: files, stagingFolder: stagingFolder });
        }
    }

    private async waitForAllCalls(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            const startTime = Date.now();
            const checkStatus = (finishedCalls: number, totalCalls: number, errorOccured: boolean) => {
                if (finishedCalls === totalCalls) { // check condition
                    resolve(true);
                } else if (Date.now() > startTime + 3000) { // timout after 3 seconds
                    console.error('Deleting files timed out!');
                    resolve(false);
                } else if (errorOccured) {
                    resolve(false);
                }
                else {
                    window.setTimeout(() => { checkStatus(this.successfulCalls, this.totalCalls, this.callWithError) }, 300); // recheck after 0.3 seconds
                }
            }
            checkStatus(this.successfulCalls, this.totalCalls, this.callWithError);
        });
    }

    private async deleteSelectedFolder() {
        const stagingFolder = Array.from(this.state.stagingFolder);
        const folderIndex = stagingFolder.findIndex((folder: IStagingFolder) => folder.layerPath === this.state.selectedNavKey);
        const folderPath = stagingFolder[folderIndex].path.substring(1); // don't take first / the backend will throw an error

        const requestOptions = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.props.token
            }
        };

        fetch(configData.SERVER_URL + '/staging?path=' + folderPath, requestOptions)
            .then(async response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.props.timedOutSession();
                    }
                    else {
                        console.error(response);
                        this.setState({ loading: true, });
                    }
                } else {
                    stagingFolder.splice(folderIndex, 1);

                    this.setState({ stagingFolder: stagingFolder });
                    this.loadFolderNavigation();
                }
            })
            .catch(error => {
                console.error(error);
                this.callWithError = true;
                this.props.onErrorHappened();
                this.setState({ loading: true, });
            });
    }

    private deleteAction() {
        this.setState({ showDeleteDialog: false });
        if (this.state.deleteDialogTitle === "Delete Folder") {
            this.deleteSelectedFolder();
        } else {
            this.deleteSelectedFiles();
        }
    }

    public render() {
        const commandBarItems: ICommandBarItemProps[] = [
            {
                key: 'upload',
                text: 'Upload File',
                iconProps: { iconName: 'Upload' },
                onClick: (ev?: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) => {
                    this.openSelectFileDialog(ev);
                },
            },
            {
                key: 'deleteFile',
                text: 'Delete File(s)',
                style: { color: this._selection.count < 1 ? "" : SharedColors.red10 },
                disabled: this._selection.count < 1,
                iconProps: { iconName: 'Delete', style: { color: this._selection.count < 1 ? "" : SharedColors.red10 } },
                onClick: (ev?: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) => {
                    ev?.persist();
                    this.setState({
                        showDeleteDialog: true,
                        deleteDialogTitle: "Delete File(s)",
                        deleteDialogText: "Are you sure to delete the file(s)? This action will also delete its files and subfolders. This action cannot be undone."
                    });
                },
            },
            {
                key: 'deleteFolder',
                text: 'Delete Folder',
                style: { color: this.state.selectedNavKey === "0" ? "" : SharedColors.red10 },
                disabled: this.state.selectedNavKey === "0",
                iconProps: { iconName: 'FabricDocLibrary', style: { color: this.state.selectedNavKey === "0" ? "" : SharedColors.red10 } },
                onClick: (ev?: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) => {
                    ev?.persist();
                    this.setState({
                        showDeleteDialog: true,
                        deleteDialogTitle: "Delete Folder",
                        deleteDialogText: "Are you sure to delete the folder? This action will also delete its files and subfolders. This action cannot be undone."
                    });
                },
            },
        ];

        return (
            <Stack style={{ width: "100%" }}>
                <OverrideStagingFileDialog
                    onConfirm={() => this.deleteDuplicates()}
                    onDismiss={() => this.setState({ showOverrideFileDialog: false })}
                    text="One or more files do already exist with the name of the selected files. If you continue the file in the staging area will be overwritten. Are you sure that you want to continue?"
                    title="Override existing files?"
                    hidden={!this.state.showOverrideFileDialog}
                />
                <DeleteStagingDialog
                    onConfirm={() => this.deleteAction()}
                    onDismiss={() => this.setState({ showDeleteDialog: false })}
                    text={this.state.deleteDialogText}
                    title={this.state.deleteDialogTitle}
                    hidden={!this.state.showDeleteDialog}
                />
                <CreateStagingFolderDialog
                    currentFolder={this.state.currentFolderPath}
                    token={this.props.token}
                    hidden={!this.state.showCreateStagingFolderDialog}
                    onDismiss={() => this.setState({ showCreateStagingFolderDialog: false })}
                    onFolderCreated={() => { this.setState({ showCreateStagingFolderDialog: false }); this.loadFolderNavigation() }}
                    timedOutSession={() => this.props.timedOutSession()}
                />
                <Stack horizontal styles={{
                    root: {
                        width: "100%",
                        padding: 10
                    }
                }} tokens={stackTokens}>
                    <div style={{
                        backgroundColor: NeutralColors.white,
                        boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)",
                        padding: 5,
                        height: window.innerHeight - 110
                    }}>
                        <Nav
                            selectedKey={this.state.selectedNavKey}
                            styles={{ root: { width: 200, position: "sticky", top: 80, maxHeight: window.innerHeight - 160, marginBottom: 10 } }}
                            groups={this.state.navLinkGroups}
                            onLinkClick={(e, item) => this.selectedFolder(item?.key)}
                        />
                        <DefaultButton
                            text="Create new Folder"
                            onClick={() => {
                                const stagingFolder = Array.from(this.state.stagingFolder);
                                const folderIndex = stagingFolder.findIndex((folder: IStagingFolder) => folder.layerPath === this.state.selectedNavKey);
                                const folderPath = stagingFolder[folderIndex].path.substring(1); // don't take first / the backend will throw an error
                                this.setState({ showCreateStagingFolderDialog: true, currentFolderPath: folderPath })
                            }}
                            iconProps={{ iconName: 'NewFolder' }}
                        />
                    </div>
                    <Stack styles={{
                        root: {
                            width: "100%",
                            backgroundColor: NeutralColors.white,
                            boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)",
                            padding: 5
                        }
                    }}>
                        <CommandBar
                            items={commandBarItems}
                        />
                        {this.state.files.length > 0 ?
                            <MarqueeSelection selection={this._selection}>
                                <DetailsList
                                    items={this.state.files}
                                    selectionMode={SelectionMode.multiple}
                                    columns={this._columns}
                                    setKey="set"
                                    layoutMode={DetailsListLayoutMode.justified}
                                    isHeaderVisible={true}
                                    selection={this._selection}
                                    selectionPreservedOnEmptyClick={true}
                                    ariaLabelForSelectionColumn="Toggle selection"
                                    ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                                    checkButtonAriaLabel="select row"
                                />
                            </MarqueeSelection>
                            : null}
                    </Stack>
                </Stack>
            </Stack>
        );
    }
};
