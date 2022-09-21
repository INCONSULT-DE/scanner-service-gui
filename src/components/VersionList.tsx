import * as React from 'react';
import { DetailsList, IGroup, IStackTokens, DetailsListLayoutMode, MarqueeSelection, Text, Selection, CommandBar, IStackStyles, ICommandBarItemProps, Panel, PanelType, INavLinkGroup, Nav, Stack } from '@fluentui/react';
import { NeutralColors } from '@fluentui/theme';

import configData from "../config.json";
import IDocument from '../models/IDocument';
import IVersion from '../models/IVersion';
import VersionDetails from './VersionDetails';
import IPackage from '../models/IPackage';

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

    private _columns = [
        { key: 'column1', name: 'ID', fieldName: 'id', minWidth: 50, maxWidth: 100, isResizable: true },
        { key: 'column3', name: 'Name', fieldName: 'name', minWidth: 200, maxWidth: 700, isResizable: true },
    ];

    private _selection = new Selection({
        onSelectionChanged: () => this.setState({ selectionDetails: "demo" }),
    });

    public state = {
        error: false,
        errorMessage: "",
        loading: false,
        documents: new Array<IDocument>(),
        versions: new Array<IVersion>(),
        groups: new Array<IGroup>(),
        packages: new Array<IPackage>(),
        selectionDetails: "",
        showDetailPane: false,
        navLinkGroups: new Array<INavLinkGroup>(),
    };

    public componentDidMount() {
        this.loadPackages();
    }

    private async loadPackages() {
        this.setState({ loading: true });

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

    private selectedPackage(packageKey: string | undefined) {
        if (packageKey) {
            console.log(packageKey);

            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.props.token
                }
            };
            fetch(configData.SERVER_URL + '/document', requestOptions)
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
                                name: document.name
                            });

                            documentGroups.push({ key: 'document' + index, name: 'Document: ' + document.name, startIndex: index, count: 1, level: 1, isCollapsed: true });

                            versions.push({
                                id: document.id,
                                name: document.name
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
    }



    public render() {
        const _items: ICommandBarItemProps[] = [
            {
                key: 'Info',
                text: 'Info',
                iconProps: { iconName: 'Info' },
                onClick: () => this.setState({ showDetailPane: true }),
                disabled: this._selection.count !== 1
            },
        ];
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
                <Stack horizontal styles={{ root: { width: "100%", padding: 10 } }} tokens={stackTokens}>
                    <div style={{
                        backgroundColor: NeutralColors.white,
                        boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)",
                        padding: 5,
                        height: window.innerHeight - 110
                    }}>
                        <Nav styles={{
                            root: {
                                width: 200, position: "sticky", top: 80
                            }
                        }} groups={this.state.navLinkGroups} onLinkClick={(e, item) => this.selectedPackage(item?.key)} />
                    </div>
                    {
                        this.state.versions.length < 1 ?
                            <Stack styles={documentSelectionStackStyles}>
                                <Text variant='medium'>Please select a Package</Text>
                            </Stack>
                            :
                            <Stack styles={documentSelectionStackStyles}>
                                <CommandBar
                                    items={_items}
                                />
                                <div style={{ maxHeight: window.innerHeight - 165, overflow: "auto" }}>
                                    <MarqueeSelection selection={this._selection}>
                                        <DetailsList
                                            items={this.state.versions}
                                            groups={this.state.groups}
                                            columns={this._columns}
                                            layoutMode={DetailsListLayoutMode.justified}
                                            selection={this._selection}
                                            selectionPreservedOnEmptyClick={true}
                                            checkButtonAriaLabel="select row"
                                            groupProps={{
                                                showEmptyGroups: true,
                                            }}
                                        />
                                    </MarqueeSelection>
                                </div>
                            </Stack>
                    }
                </Stack >
            </div >
        );
    }
};
