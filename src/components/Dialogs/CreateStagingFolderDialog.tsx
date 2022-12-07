import * as React from 'react';
import { Dialog, DialogType, DialogFooter, PrimaryButton, TextField, Text } from '@fluentui/react';

import configData from "../../config.json";

export default class CreateStagingFolderDialog extends React.Component<any, any> {
    public state = {
        creatingFolder: false,
        folderPath: this.props.currentFolder,
    };

    private async createPackage() {
        this.setState({ creatingFolder: true });

        const formData = new FormData();
        formData.append("path", this.state.folderPath);

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + this.props.token
            },
            body: formData
        };

        await fetch(configData.SERVER_URL + '/staging', requestOptions)
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
                    this.setState({
                        creatingFolder: false,
                    });
                    this.props.onFolderCreated();
                }
            });
    }

    public render() {
        return (
            <Dialog
                hidden={this.props.hidden}
                onDismiss={() => this.props.onDismiss()}
                dialogContentProps={{
                    type: DialogType.normal,
                    isMultiline: true,
                    title: "Create a folder",
                }}
                modalProps={{ isBlocking: true }}
            >
                <Text block>Add the path you want to create.</Text>
                <Text block>You can add the complete path, even if some folder are not existing. All none existing folder will get created.</Text>
                <Text block>Example path: /folder_1/folder_2/folder_3</Text>
                <TextField disabled={this.state.creatingFolder} label="Folder path" required defaultValue={"/" + this.props.currentFolder} onChange={(e: any, value?: string) => this.setState({ folderPath: value ? value : "" })} />
                <DialogFooter>
                    <PrimaryButton disabled={this.state.creatingFolder} onClick={() => this.createPackage()} text="Create Folder" />
                </DialogFooter>
            </Dialog>
        );
    }
};
