import * as React from 'react';
import { Dialog, DialogType, Toggle, DialogFooter, PrimaryButton, TextField } from '@fluentui/react';

import configData from "../../config.json";

export default class CreatePackageDialog extends React.Component<any, any> {
    public state = {
        creatingPackage: false,
        includeUnassigned: true,
        packageName: "",
        packageConfig: "",
        packageStatus: "",
    };

    private async createPackage() {
        this.setState({ creatingPackage: true });

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.props.token
            },
            body: JSON.stringify({
                "add_document": [],
                "include_all_unassigned": this.state.includeUnassigned,
                //"package_config": this.state.packageConfig,
                "package_name": this.state.packageName,
                //"package_status": this.state.packageStatus,
                "remove_document": []
            })
        };

        await fetch(configData.SERVER_URL + '/package', requestOptions)
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
                        creatingPackage: false,
                    });
                    this.props.onDismiss();
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
                    title: "Create a package",
                }}
                modalProps={{ isBlocking: true }}
            >
                <Toggle label="Include all unassigned documents" defaultChecked={this.state.includeUnassigned} onText="On" offText="Off" onChange={() => this.setState({ includeUnassigned: !this.state.includeUnassigned })} />
                <TextField disabled={this.state.creatingPackage} label="Package name" required onChange={(e: any, value?: string) => this.setState({ packageName: value ? value : "" })} />
                {
                    //<TextField disabled={this.state.creatingPackage} label="Package config" onChange={(e: any, value?: string) => this.setState({ packageConfig: value ? value : "" })} />
                    //<TextField disabled={this.state.creatingPackage} label="Package status" onChange={(e: any, value?: string) => this.setState({ packageStatus: value ? value : "" })} />
                }
                <DialogFooter>
                    <PrimaryButton disabled={this.state.creatingPackage || this.state.packageName === ""} onClick={() => this.createPackage()} text="Create Package" />
                </DialogFooter>
            </Dialog>
        );
    }
};
