import * as React from 'react';
import { DetailsList, IGroup, IStackTokens, Dialog, DefaultButton, DialogFooter, DialogType, PrimaryButton, DetailsListLayoutMode, MarqueeSelection, Text, Selection, CommandBar, IStackStyles, ICommandBarItemProps, Panel, PanelType, INavLinkGroup, Nav, Stack } from '@fluentui/react';
import { NeutralColors } from '@fluentui/theme';
import PropertyAndValueText from './PropertyAndValueText';

import configData from "../config.json";
import IDocument from '../models/IDocument';
import IVersion from '../models/IVersion';
import VersionDetails from './VersionDetails';
import IPackage from '../models/IPackage';
import MoveToPackageDialog from './Dialogs/MoveToPackageDialog';
import CreatePackageDialog from './Dialogs/CreatePackageDialog';

const stackTokens: IStackTokens = { childrenGap: 10 };
const documentSelectionStackStyles: Partial<IStackStyles> = {
    root: {
        margin: '0 auto',
        width: 'calc(100% - 220px)',
        height: 'calc(100% - 80px)',
        color: '#605e5c',
        padding: 10,
        backgroundColor: NeutralColors.white,
        boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)",
    },
};

export default class VersionList extends React.Component<any, any> {
    private _selection = new Selection({
        onSelectionChanged: () => {

            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.props.token
                }
            };

            const selectedItemIds = new Array<any>();
            for (let selectedItem of this._selection.getSelection()) {
                selectedItemIds.push(selectedItem.key);
            }

            const actions = Array.from(this.state.actions);

            // find info button and enable it if there is just one selection
            const infoButtonIndex = actions.findIndex(item => item.key === 'Info');
            actions[infoButtonIndex].disabled = this._selection.count !== 1;
            const moveButtonIndex = actions.findIndex(item => item.key === 'MoveToPackage');
            actions[moveButtonIndex].disabled = this._selection.count < 1;

            const actionsButtonIndex = actions.findIndex(item => item.key === 'UnforcedActions');
            const actionsForcedButtonIndex = actions.findIndex(item => item.key === 'ForcedActions');

            // set all buttons to disabled
            actions[actionsButtonIndex].subMenuProps!.items.map((item: ICommandBarItemProps) => { item.disabled = true; return item; });
            actions[actionsForcedButtonIndex].subMenuProps!.items.map((item: ICommandBarItemProps) => { item.disabled = true; return item; });

            if (selectedItemIds.length < 1) {
                this.setState({ actions: actions, });
            }
            else {
                //const queryParameter = selectedItemIds.join("&version-ids=");
                const queryParameter = selectedItemIds.join(",");

                fetch(configData.SERVER_URL + '/available-actions?version-ids=' + queryParameter, requestOptions)
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

                            data.forEach((action: any, index: number) => {
                                const unforcedButtonIndex = actions[actionsButtonIndex].subMenuProps?.items.findIndex(item => item.key === action.name)!;
                                const forcedButtonIndex = actions[actionsForcedButtonIndex].subMenuProps?.items.findIndex(item => item.key === action.name)!;

                                // enable button because it came back as result
                                actions[actionsButtonIndex].subMenuProps!.items[unforcedButtonIndex].disabled = false;
                                actions[actionsForcedButtonIndex].subMenuProps!.items[forcedButtonIndex].disabled = false;
                            });
                            this.setState({ actions: actions });
                        }
                    })
                    .catch(error => {
                        console.error(error);
                        this.props.onErrorHappened();
                        this.setState({ loading: true,  });
                    });
            }
        },
    });

    private _columns = [
        { key: 'column1', name: 'ID', fieldName: 'id', minWidth: 50, maxWidth: 100, isResizable: true, isRowHeader: true, data: 'number', },
        { key: 'column2', name: 'Name', fieldName: 'name', minWidth: 200, maxWidth: 700, isResizable: true, data: 'string', },
        { key: 'column3', name: 'Status', fieldName: 'status', minWidth: 200, maxWidth: 700, isResizable: true },
        {
            key: 'column4', name: 'Modified', fieldName: 'modified', minWidth: 200, maxWidth: 700, isResizable: true, isPadded: true, data: 'number',
            onRender: (item: IVersion) => {
                return <span>{item.modifiedLocaleString}</span>;
            },
        },
        {
            key: 'column5', name: 'Created', fieldName: 'created', minWidth: 200, maxWidth: 700, isResizable: true, isPadded: true, data: 'number',
            onRender: (item: IVersion) => {
                return <span>{item.createdLocaleString}</span>;
            },
        },
    ];

    public state = {
        error: false,
        errorMessage: "",
        loading: false,
        columns: this._columns,
        actions: new Array<ICommandBarItemProps>(),
        documents: new Array<IDocument>(),
        versions: new Array<IVersion>(),
        groups: new Array<IGroup>(),
        packages: new Array<IPackage>(),
        showDetailPane: false,
        showActionResultDialog: false,
        showMoveToPackageDialog: false,
        showCreatePackageDialog: false,
        actionResultBody: <></>,
        actionResultHeader: "",
        packageSelected: -1,
        navLinkGroups: new Array<INavLinkGroup>(),
        groupedView: false,
    };

    public componentDidMount() {
        this.loadPackages();
    }

    private async loadPackages() {
        this.setState({ loading: true, showCreatePackageDialog: false });
        
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.props.token
            }
        };

        fetch(configData.SERVER_URL + '/package', requestOptions)
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

                    const packages = new Array<IPackage>();
                    const navLinks: Array<INavLinkGroup> = [
                        {
                            name: 'Packages',
                            links: [
                            ],
                        },
                    ];

                    data.data.forEach((packageItem: any, index: number) => {
                        packages.push({
                            id: packageItem.id,
                            name: packageItem.name
                        });
                        navLinks[0].links.push({
                            key: packageItem.id,
                            name: packageItem.name,
                            url: '',
                        });
                    });

                    this.setState({
                        loading: false,
                        packages: packages,
                        navLinkGroups: navLinks
                    });
                }
            })
            .catch(error => {
                console.error(error);
                this.props.onErrorHappened();
                this.setState({ loading: true, });
            });

    }

    private startTask(taskName: string, force = false) {
        let scope;
        if (this._selection.isAllSelected()) {
            scope = {
                "package": this.state.packageSelected
            };
        }
        else {
            const selectedItemIds = [];
            for (let selectedItem of this._selection.getSelection()) {
                selectedItemIds.push(selectedItem.key);
            }
            scope = {
                "versions": selectedItemIds
            };
        }

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.props.token
            },
            body: JSON.stringify({
                "task_name": taskName,
                "scope": scope,
                "force": force,
            })
        };

        fetch(configData.SERVER_URL + '/task', requestOptions)
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
                    const actionResultText =
                        <>
                            <PropertyAndValueText property="Requests queue missing" value={data.result.requests_queue_missing} />
                            <PropertyAndValueText property="Requests queued" value={data.result.requests_queued} />
                            <PropertyAndValueText property="Requests skipped" value={data.result.requests_skipped} />
                            <PropertyAndValueText property="Requests total" value={data.result.requests_total} />
                            <PropertyAndValueText property="Task ID" value={data.result.task_id} />
                        </>;

                    this.setState({ actionResultHeader: data.message, actionResultBody: actionResultText, showActionResultDialog: true });
                }
            })
            .catch(error => {
                console.error(error);
                this.props.onErrorHappened();
                this.setState({ loading: true,  });
            });
    }


    private reloadPackage() {
        this.setState({
            loading: true,
            showMoveToPackageDialog: false
        });
        if (this.state.packageSelected > -1) {
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.props.token
                }
            };

            fetch(configData.SERVER_URL + '/grid?offset=0&limit=1000&package-id=' + this.state.packageSelected, requestOptions)
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
                        const documents = new Array<IDocument>();
                        const documentGroups = new Array<IGroup>();
                        const versions = new Array<IVersion>();

                        data.data.forEach((document: any, index: number) => {
                            documents.push({
                                id: document.id,
                                title: document.title,
                                name: document.name,
                                packageId: document.packageId,
                                modified: new Date(document.modified),
                                created: new Date(document.created),
                            });

                            documentGroups.push({ key: 'document' + index, name: 'Document: ' + document.name, startIndex: index, count: 1, level: 1, isCollapsed: true });

                            document.versions.forEach((version: any, index: number) => {
                                versions.push({
                                    id: version.id,
                                    key: version.id,
                                    name: version.name,
                                    status: version.status,
                                    created: new Date(version.created),
                                    createdLocaleString: new Date(version.created).toLocaleString(),
                                    modified: new Date(version.modified),
                                    modifiedLocaleString: new Date(version.modified).toLocaleString(),
                                    documentId: version.docId,
                                });
                            });
                        });

                        this.setState({
                            groups: documentGroups,
                            documents: documents,
                            versions: versions,
                            loading: false,
                        });
                    }
                })
                .catch(error => {
                    console.error(error);
                    this.props.onErrorHappened();
                    this.setState({ loading: true, });
                });

        }
        else {
            this.setState({
                groups: new Array<IGroup>(),
                documents: new Array<IDocument>(),
                versions: new Array<IVersion>(),
                loading: false,
            });
        }
    }

    private selectedPackage(packageKey: string | undefined) {
        if (packageKey) {
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.props.token
                }
            };

            fetch(configData.SERVER_URL + '/available-actions?package-id=' + packageKey, requestOptions)
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
                        const actionItems = new Array<ICommandBarItemProps>();

                        // Info Button should always be visible 
                        actionItems.push(
                            {
                                key: 'Info',
                                text: 'Info',
                                iconProps: { iconName: 'Info' },
                                onClick: () => this.setState({ showDetailPane: true }),
                                disabled: true
                            },
                        );
                        actionItems.push(
                            {
                                key: 'MoveToPackage',
                                text: 'Move to Package',
                                iconProps: { iconName: 'MoveToFolder' },
                                onClick: () => this.setState({ showMoveToPackageDialog: true }),
                                disabled: true
                            },
                        );

                        // add custom buttons
                        const submenuActionsUnforced = new Array<ICommandBarItemProps>();
                        data.forEach((action: any, index: number) => {
                            submenuActionsUnforced.push(
                                {
                                    key: action.name,
                                    text: action.name,
                                    onClick: () => this.startTask(action.name),
                                    disabled: true
                                },
                            );
                        });

                        actionItems.push(
                            {
                                key: "UnforcedActions",
                                text: "Actions",
                                iconProps: { iconName: 'TriggerAuto' },
                                subMenuProps: {
                                    items: submenuActionsUnforced,
                                },
                            },
                        );

                        const submenuActionsForced = new Array<ICommandBarItemProps>();
                        data.forEach((action: any, index: number) => {
                            submenuActionsForced.push(
                                {
                                    key: action.name,
                                    text: action.name,
                                    onClick: () => this.startTask(action.name, true),
                                    disabled: true
                                },
                            );
                        });

                        actionItems.push(
                            {
                                key: "ForcedActions",
                                text: "Actions with force",
                                iconProps: { iconName: 'TriggerUser' },
                                subMenuProps: {
                                    items: submenuActionsForced,
                                },
                            },
                        );

                        // Add refresh and View button to the end
                        actionItems.push(
                            {
                                key: 'Refresh',
                                text: 'Refresh',
                                iconProps: { iconName: 'Refresh' },
                                onClick: () => this.selectedPackage(packageKey),
                            },
                        );

                        actionItems.push(
                            {
                                key: 'SwitchView',
                                text: 'Switch View',
                                iconProps: { iconName: 'ViewOriginal' },
                                onClick: () => this.setState({ groupedView: !this.state.groupedView }),
                            },
                        );

                        fetch(configData.SERVER_URL + '/grid?offset=0&limit=1000&package-id=' + packageKey, requestOptions)
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
                                    const documents = new Array<IDocument>();
                                    const documentGroups = new Array<IGroup>();
                                    const versions = new Array<IVersion>();

                                    data.data.forEach((document: any, index: number) => {
                                        documents.push({
                                            id: document.id,
                                            title: document.title,
                                            name: document.name,
                                            packageId: document.packageId,
                                            modified: new Date(document.modified),
                                            created: new Date(document.created),
                                        });

                                        documentGroups.push({ key: 'document' + index, name: 'Document: ' + document.name, startIndex: index, count: 1, level: 1, isCollapsed: true });

                                        document.versions.forEach((version: any, index: number) => {

                                            versions.push({
                                                id: version.id,
                                                key: version.id,
                                                name: version.name,
                                                status: version.status,
                                                created: new Date(version.created),
                                                createdLocaleString: new Date(version.created).toLocaleString(),
                                                modified: new Date(version.modified),
                                                modifiedLocaleString: new Date(version.modified).toLocaleString(),
                                                documentId: version.docId,
                                            });
                                        });
                                    });

                                    this.setState({
                                        groups: documentGroups,
                                        documents: documents,
                                        versions: versions,
                                        actions: actionItems,
                                        packageSelected: packageKey,
                                        loading: false,
                                    });
                                }
                            })
                            .catch(error => {
                                console.error(error);
                                this.props.onErrorHappened();
                                this.setState({ loading: true, });
                            });
                    }
                })
                .catch(error => {
                    console.error(error);
                    this.props.onErrorHappened();
                    this.setState({ loading: true, });
                });
        }
        else {
            this.setState({
                groups: new Array<IGroup>(),
                documents: new Array<IDocument>(),
                versions: new Array<IVersion>(),
                packageSelected: packageKey,
                loading: false,
            });
        }
    }

    public render() {
        return (
            <div style={{ width: "100%" }}>
                <Panel
                    headerText="Version Details"
                    isOpen={this.state.showDetailPane}
                    onDismiss={() => this.setState({ showDetailPane: false })}
                    isLightDismiss
                    closeButtonAriaLabel="Close"
                    type={PanelType.medium}
                >
                    <VersionDetails selectedItem={this._selection.getSelection()[0]} onErrorHappened={() => this.props.onErrorHappened()} token={this.props.token} />
                </Panel>
                <Dialog
                    hidden={!this.state.showActionResultDialog}
                    onDismiss={() => this.setState({ showActionResultDialog: false })}
                    dialogContentProps={{
                        type: DialogType.normal,
                        isMultiline: true,
                        title: this.state.actionResultHeader,
                    }}
                    modalProps={{ isBlocking: true }}
                >
                    {this.state.actionResultBody}
                    <DialogFooter>
                        <PrimaryButton onClick={() => this.setState({ showActionResultDialog: false })} text="OK" />
                    </DialogFooter>
                </Dialog>

                <MoveToPackageDialog
                    token={this.props.token}
                    packages={this.state.packages}
                    selectedFiles={this._selection.getSelection()}
                    hidden={!this.state.showMoveToPackageDialog}
                    onDismiss={() => this.reloadPackage()}
                    timedOutSession={() => this.props.timedOutSession()}
                />
                <CreatePackageDialog
                    token={this.props.token}
                    hidden={!this.state.showCreatePackageDialog}
                    onDismiss={() => this.loadPackages()}
                    timedOutSession={() => this.props.timedOutSession()}
                />

                <Stack horizontal styles={{ root: { width: "100%", padding: 10 } }} tokens={stackTokens}>
                    <div
                        style={{
                            backgroundColor: NeutralColors.white,
                            boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)",
                            padding: 5,
                            height: window.innerHeight - 110
                        }}
                    >
                        <Nav
                            styles={{ root: { width: 200, position: "sticky", top: 80, maxHeight: window.innerHeight - 160, marginBottom: 10 } }}
                            groups={this.state.navLinkGroups}
                            onLinkClick={(e, item) => this.selectedPackage(item?.key)}
                        />
                        <DefaultButton text="Create new Package" onClick={() => this.setState({ showCreatePackageDialog: true })} iconProps={{ iconName: 'NewFolder' }} />
                    </div>
                    {
                        this.state.versions.length < 1 ?
                            this.state.packageSelected !== -1 ?
                                <Stack styles={documentSelectionStackStyles}>
                                    <Text variant='medium'>No documents found</Text>
                                </Stack>
                                :
                                <Stack styles={documentSelectionStackStyles}>
                                    <Text variant='medium'>Please select a Package</Text>
                                </Stack>
                            :
                            <Stack styles={documentSelectionStackStyles}>
                                <CommandBar
                                    items={this.state.actions}
                                />
                                <div style={{ maxHeight: window.innerHeight - 165, overflow: "auto" }}>
                                    <MarqueeSelection selection={this._selection}>
                                        {this.state.groupedView ?
                                            <DetailsList
                                                items={this.state.versions}
                                                groups={this.state.groups}
                                                columns={this.state.columns}
                                                layoutMode={DetailsListLayoutMode.justified}
                                                selection={this._selection}
                                                selectionPreservedOnEmptyClick={true}
                                                checkButtonAriaLabel="select row"
                                                groupProps={{
                                                    showEmptyGroups: true,
                                                }}
                                            />
                                            :
                                            <DetailsList
                                                items={this.state.versions}
                                                columns={this.state.columns}
                                                layoutMode={DetailsListLayoutMode.justified}
                                                selection={this._selection}
                                                selectionPreservedOnEmptyClick={true}
                                                checkButtonAriaLabel="select row"
                                            />
                                        }
                                    </MarqueeSelection>
                                </div>
                            </Stack>
                    }
                </Stack >
            </div >
        );
    }
};
