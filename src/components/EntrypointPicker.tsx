import * as React from 'react';
import { FontIcon, Stack, Label, ActionButton, TextField } from '@fluentui/react';

import configData from "../config.json";
import { IStagingFolderFlatHierarchy } from '../models/IStaging';

export default class EntrypointPicker extends React.Component<any, any> {
    public state = {
        loading: false,
        stagingFolders: new Array<IStagingFolderFlatHierarchy>(),
        currentPath: "/",
    };

    public componentDidMount(): void {
        this.getEntrypoints();
    }

    private getEntrypoints() {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.props.token
            }
        };
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
                    const stagingFolders = this.createStagingFolderList(data, "/");
                    this.setState({ stagingFolders: stagingFolders, });
                }
            })
            .catch(error => {
                console.error(error);
                this.props.onErrorHappened();
                this.setState({ loading: true, });
            });
    }

    private createStagingFolderList(currentData: any, path: string) {
        let result = new Array<IStagingFolderFlatHierarchy>();


        const currentFolderName = currentData.name === "staging" ? "" : currentData.name;
        const currentPath = path === "/" ? path + currentFolderName : path + "/" + currentFolderName;

        const hasSubfolder = currentData.children.findIndex((item: any) => item.type === "directory") > -1;
        if (hasSubfolder) {
            const subFolders = currentData.children.filter((item: any) => item.type === "directory");

            const subFolderList = new Array<string>();
            for (let subFolder of subFolders) {
                subFolderList.push(subFolder.name);
                const subFolderArray = this.createStagingFolderList(subFolder, currentPath);
                result = result.concat(subFolderArray);
            }

            result.push({
                path: currentPath,
                name: currentFolderName,
                subFolder: subFolderList
            });
        }
        else {
            result.push({
                path: currentPath,
                name: currentFolderName,
                subFolder: null
            });
        }
        return result;

    }
    private folderSelected(selectedPath: string) {
        const itemIndex = this.state.stagingFolders.findIndex((folder: IStagingFolderFlatHierarchy) => folder.path === selectedPath);
        if (itemIndex !== -1) {
            const currentFolder = this.state.stagingFolders[itemIndex] as IStagingFolderFlatHierarchy;

            this.setState({
                currentPath: currentFolder.path,
            }, () => this.props.onChange(this.state.currentPath));
        }
    }

    private navigateBack() {
        let parentPath = this.state.currentPath.substring(0, this.state.currentPath.lastIndexOf("/"));
        if (parentPath === "") {
            parentPath = "/";
        }
        const itemIndex = this.state.stagingFolders.findIndex((folder: IStagingFolderFlatHierarchy) => folder.path === parentPath);
        if (itemIndex !== -1) {
            const currentFolder = this.state.stagingFolders[itemIndex] as IStagingFolderFlatHierarchy;

            this.setState({
                currentPath: currentFolder.path,
            }, () => this.props.onChange(this.state.currentPath));
        }
    }

    public render() {
        let currentLevel = {} as IStagingFolderFlatHierarchy;
        const itemIndex = this.state.stagingFolders.findIndex((folder: IStagingFolderFlatHierarchy) => folder.path === this.state.currentPath);
        if (itemIndex !== -1) {
            currentLevel = this.state.stagingFolders[itemIndex] as IStagingFolderFlatHierarchy;
        }

        return (
            <Stack styles={{ root: { marginBottom: 20 } }}>
                <TextField label="Entrypoint" disabled value={this.state.currentPath} />
                <Label>Pick a folder</Label>
                <Stack tokens={{ childrenGap: 10 }} styles={{ root: { maxHeight: 170, overflowY: "auto" } }}>
                    {
                        this.state.currentPath !== "/" ?
                            <ActionButton
                                allowDisabledFocus
                                disabled={this.props.disabled}
                                onClick={() => this.navigateBack()}
                            >
                                <FontIcon aria-label="ChevronLeft" iconName="ChevronLeft" style={{ fontSize: 15, height: 15, width: 15, marginRight: 10 }} />
                                Go back
                            </ActionButton>
                            :
                            null
                    }
                    {
                        currentLevel === null || currentLevel.subFolder === null || currentLevel.subFolder === undefined ?
                            null
                            :
                            currentLevel.subFolder.map((subFolderName: string) => {
                                return (
                                    <ActionButton
                                        key={subFolderName}
                                        allowDisabledFocus
                                        disabled={this.props.disabled}
                                        onClick={() => this.folderSelected(currentLevel.path === "/" ? currentLevel.path + subFolderName : currentLevel.path + "/" + subFolderName)}
                                    >
                                        {subFolderName}
                                        <FontIcon aria-label="ChevronRight" iconName="ChevronRight" style={{ fontSize: 15, height: 15, width: 15, marginLeft: 10 }} />
                                    </ActionButton>
                                )
                            })
                    }
                </Stack>
            </Stack>
        );
    }
};
