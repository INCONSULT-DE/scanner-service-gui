import * as React from 'react';
import { Dialog, DialogType, DialogFooter, PrimaryButton, Dropdown, Label, ActionButton, Toggle, TextField, ComboBox, IComboBoxOption } from '@fluentui/react';

import configData from "../../config.json";

import IStartScannerBody from '../../models/IStartScannerBody';

import EntrypointPicker from '../EntrypointPicker';

export default class StartStagingScannerDialog extends React.Component<any, any> {
    public state = {
        loading: false,
        startingScanner: false,
        force: false,
        entrypoint: "",
        packagename: "",
        selectedPackageKey: "",
        useExistingPackageName: false,
        packages: new Array<IComboBoxOption>(),
    };

    public componentDidMount(): void {
        this.loadPackages();
    }

    private loadPackages() {
        this.setState({ loading: true, });

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
                }
                else {
                    const packages: IComboBoxOption[] = [
                    ];

                    data.data.forEach((packageItem: any, index: number) => {
                        packages.push({
                            key: packageItem.id,
                            text: packageItem.name
                        });
                    });

                    this.setState({
                        loading: false,
                        packages: packages,
                    });
                }
            })
            .catch(error => {
                console.error(error);
                this.props.onErrorHappened();
                this.setState({ loading: true, });
            });
    }

    private async startScanning() {
        this.setState({ startingScanner: true });

        const body: IStartScannerBody = {
            scanner_id: this.props.scannerId,
            scanner_parameters: {
                entry_point: this.state.entrypoint !== "" ? this.state.entrypoint : undefined,
                package_name: this.state.packagename !== "" ? this.state.packagename : undefined,
                use_existing_package: this.state.packagename !== "" ? this.state.useExistingPackageName : undefined,
            },
            force: this.state.force
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.props.token
            },
            body: JSON.stringify(body)
        };

        await fetch(configData.SERVER_URL + '/scanner', requestOptions)
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
                    this.setState({
                        startingScanner: false,
                        loading: false,
                        force: false,
                        entrypoint: "",
                        packagename: "",
                        selectedPackageKey: "",
                        useExistingPackageName: false,
                    });
                    this.props.onStarted();
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
                    title: this.props.scannerName,
                }}
                modalProps={{ isBlocking: true }}
            >
                <EntrypointPicker
                    token={this.props.token}
                    timedOutSession={() => this.props.timedOutSession()}
                    onChange={(entrypoint: string) => this.setState({entrypoint: entrypoint})}
                    disabled={this.state.loading || this.state.startingScanner}
                />
                <ComboBox
                    disabled={this.state.loading || this.state.startingScanner}
                    label="Package"
                    selectedKey={this.state.selectedPackageKey}
                    allowFreeform={true}
                    autoComplete='on'
                    options={this.state.packages}
                    onChange={(e: any, selectedOption?: IComboBoxOption, index?: number, value?: string) => {
                        if (!selectedOption && value) {
                            selectedOption = { key: "newItem", text: value };
                            const packages = Array.from(this.state.packages);
                            packages.push(selectedOption);
                            this.setState({ packages: packages });
                        }

                        this.setState({ packagename: value ? value : "", selectedPackageKey: selectedOption?.key });
                    }}
                />

                <Toggle disabled={this.state.loading || this.state.startingScanner} label="Use current package for updates" defaultChecked={this.state.useExistingPackageName} onText="On" offText="Off" onChange={() => this.setState({ useExistingPackageName: !this.state.useExistingPackageName })} />

                <Toggle disabled={this.state.loading || this.state.startingScanner} label="Force" defaultChecked={this.state.force} onText="On" offText="Off" onChange={() => this.setState({ force: !this.state.force })} />

                <DialogFooter>
                    <PrimaryButton disabled={this.state.loading || this.state.startingScanner} onClick={() => this.startScanning()} text="Start Scanner" />
                </DialogFooter>
            </Dialog>
        );
    }
};
