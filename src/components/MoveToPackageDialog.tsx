import * as React from 'react';
import { Dialog, DialogType, Text, DialogFooter, IChoiceGroupOption, PrimaryButton, ChoiceGroup } from '@fluentui/react';
import IPackage from '../models/IPackage';

import configData from "../config.json";

export default class MoveToPackageDialog extends React.Component<any, any> {
    public state = {
        selectedPackage: this.props.packages && this.props.packages.length > 0 ? this.props.packages[0].id : 0,
        movedFiles: 0,
        totalFiles: 0,
        moving: false,
    };

    private async addToPackage() {
        let movedFiles = 0;

        this.setState({ totalFiles: this.props.selectedFiles.length, moving: true });

        for (let selectedItem of this.props.selectedFiles) {
            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.props.token
                },
                body: JSON.stringify({
                    "set_package": +this.state.selectedPackage
                })
            };

            await fetch(configData.SERVER_URL + '/document/' + selectedItem.key, requestOptions)
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
                        console.log(data);
                        movedFiles++;
                        this.setState({ movedFiles: movedFiles })
                    }
                })
        }

        this.setState({
            movedFiles: 0,
            totalFiles: 0,
            moving: false,
        });
        this.props.onDismiss();
    }


    private onPackageSelected(ev: any, option: IChoiceGroupOption | undefined): void {
        if (option) {
            this.setState({ selectedPackage: option!.key });
        }
    }

    public render() {

        const options = new Array<IChoiceGroupOption>();
        if (this.props.packages) {
            this.props.packages.forEach((packageItem: IPackage, index: number) => {
                options.push({ key: packageItem.id.toString(), text: packageItem.name })
            });
        }

        return (
            <Dialog
                hidden={this.props.hidden}
                onDismiss={() => this.props.onDismiss()}
                dialogContentProps={{
                    type: DialogType.normal,
                    isMultiline: true,
                    title: "Select a destination package",
                }}
                modalProps={{ isBlocking: true }}
            >
                {
                    this.state.moving ?
                        <>
                            <Text variant="mediumPlus">Moving files.</Text><br />
                            <Text variant="mediumPlus">{this.state.movedFiles} of {this.state.totalFiles}</Text>
                        </>
                        :
                        <ChoiceGroup defaultSelectedKey={this.state.selectedPackage} options={options} onChange={(ev: any, option: any) => this.onPackageSelected(ev, option)} />
                }
                <DialogFooter>
                    <PrimaryButton disabled={this.state.moving} onClick={() => this.addToPackage()} text="Move files" />
                </DialogFooter>
            </Dialog>
        );
    }
};
