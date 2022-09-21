import * as React from 'react';
import { setVirtualParent } from '@fluentui/dom-utilities';
import { DetailsList, Stack, DetailsListLayoutMode, IStackTokens, INavLinkGroup, Nav, CommandBar, ICommandBarItemProps, Selection, SelectionMode, IColumn, TooltipHost } from '@fluentui/react';
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';
import { NeutralColors } from '@fluentui/theme';

import configData from "../config.json";
import ISelectedFile, { SelectedFileStatus } from '../models/ISelectedFile';


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


export default class FileUpload extends React.Component<any, any> {
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
            let preparedDocumentsSelected, uploadedDocumentsSelected, startedDocumentsSelected = false;
            const files = Array.from(this.state.files);
            for (let selectedDocument of this._selection.getSelection()) {
                const index = files.findIndex((item: ISelectedFile) => item.key === selectedDocument.key);

                if (files[index].status === SelectedFileStatus.Prepared) {
                    preparedDocumentsSelected = true;
                }
                if (files[index].status === SelectedFileStatus.Uploaded) {
                    uploadedDocumentsSelected = true;
                }
                if (files[index].status === SelectedFileStatus.LifeCycleStarted) {
                    startedDocumentsSelected = true;
                }
            }
            this.setState({ preparedDocumentsSelected: preparedDocumentsSelected, uploadedDocumentsSelected: uploadedDocumentsSelected, startedDocumentsSelected: startedDocumentsSelected });
        },
    });

    private selectedPackage(packageKey: string | undefined) {
        if (packageKey) {
            console.log(packageKey);

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
            onRender: (item: ISelectedFile) => (
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
            onRender: (item: ISelectedFile) => {
                return <span>{item.fileSize}</span>;
            },
        },
        {
            key: 'column6', name: 'Modify Date', fieldName: 'lastModified', minWidth: 200, maxWidth: 700, isResizable: true,
            isPadded: true,
            data: 'number',
            onColumnClick: this._onColumnClick,
            onRender: (item: ISelectedFile) => {
                return <span>{item.lastModifiedLocaleString}</span>;
            },
        },
    ];

    componentDidMount() {
        this.loadFolderNavigation();
    }

    private loadFolderNavigation() {
        const navLinks: Array<INavLinkGroup> = [
            {
                name: 'Folder',
                links: [
                ],
            },
        ];

        // todo query 
        navLinks[0].links.push({
            key: "test",
            name: "test",
            url: '',
        });

        this.setState({ navLinkGroups: navLinks });

    }

    public state = {
        error: false,
        errorMessage: "",
        loading: false,
        files: new Array<ISelectedFile>(),
        columns: this._columns,
        preparedDocumentsSelected: false,
        uploadedDocumentsSelected: false,
        startedDocumentsSelected: false,
        navLinkGroups: new Array<INavLinkGroup>(),
    };

    public render() {
        const _items: ICommandBarItemProps[] = [
            {
                key: 'selectfiles',
                text: 'Select Files',
                iconProps: { iconName: 'OpenFile' },
                onClick: (ev?: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) => {
                    ev?.persist();

                    Promise.resolve().then(() => {

                        const inputElement = document.createElement('input');
                        inputElement.style.visibility = 'hidden';
                        inputElement.setAttribute('type', 'file');
                        inputElement.setAttribute('multiple', 'true')
                        inputElement.onchange = () => {
                            const fileList = inputElement.files!;
                            const files = Array.from(this.state.files);

                            for (let i = 0; i < fileList.length; i++) {
                                const file = fileList.item(i)!;
                                const indexOfLastDot = file.name.lastIndexOf(".");
                                const fileExtension = file.name.substring(indexOfLastDot + 1);

                                files.push({
                                    key: file.name + i,
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
                                    file: file,
                                    status: SelectedFileStatus.Prepared
                                });
                            }
                            this.setState({ files: files });
                        };

                        document.body.appendChild(inputElement);
                        const target = ev?.target as HTMLElement | undefined;

                        if (target) {
                            setVirtualParent(inputElement, target);
                        }

                        inputElement.click();
                        if (target) {
                            setVirtualParent(inputElement, null);
                        }

                        setTimeout(() => {
                            inputElement.remove();
                        }, 10000);
                    });
                },
            },
            {
                key: 'upload',
                text: 'Upload',
                disabled: !this.state.preparedDocumentsSelected,
                iconProps: { iconName: 'Upload' },
                onClick: (ev?: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) => {
                    ev?.persist();

                    const files = Array.from(this.state.files);

                    for (let selectedDocument of this._selection.getSelection()) {
                        const index = files.findIndex((item: ISelectedFile) => item.key === selectedDocument.key);

                        if (files[index].status === SelectedFileStatus.Prepared) {
                            var reader = new FileReader();

                            reader.onload = (e) => {
                                var target: any = e.target;
                                var data = target.result;
                                //  console.log(data); // data ready for upload

                                files[index].status = SelectedFileStatus.Uploaded;
                                this.setState({ files: files, uploadedDocumentsSelected: true, preparedDocumentsSelected: false });
                            };

                            reader.readAsText(files[index].file);
                        }
                    }
                },
            },
            {
                key: 'startlifecycle',
                text: 'Start Lifecycle',
                disabled: !this.state.uploadedDocumentsSelected,
                iconProps: { iconName: 'WorkFlow' },
                onClick: (ev?: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) => {
                    ev?.persist();

                    const files = Array.from(this.state.files);
                    for (let selectedDocument of this._selection.getSelection()) {
                        const index = files.findIndex((item: ISelectedFile) => item.key === selectedDocument.key);

                        if (files[index].status === SelectedFileStatus.Uploaded) {
                            files[index].status = SelectedFileStatus.LifeCycleStarted;
                        }
                    }
                    this.setState({ files: files, uploadedDocumentsSelected: false });
                },
            },
            {
                key: 'delete',
                text: 'Delete',
                disabled: this._selection.count < 1,
                iconProps: { iconName: 'Delete' },
                onClick: (ev?: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) => {
                    ev?.persist();
                    const files = Array.from(this.state.files);
                    for (let selectedDocument of this._selection.getSelection()) {
                        const index = files.findIndex((item: ISelectedFile) => item.key === selectedDocument.key);
                        files.splice(index, 1);
                    }
                    this.setState({ files: files });
                },
            },
        ];

        return (
            <Stack style={{ width: "100%" }}>

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
                        <Nav styles={{ root: { width: 200, position: "sticky", top: 80 } }} groups={this.state.navLinkGroups} onLinkClick={(e, item) => this.selectedPackage(item?.key)} />
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
                            items={_items}
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
