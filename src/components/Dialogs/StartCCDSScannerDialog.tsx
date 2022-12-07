import * as React from 'react';
import { Dialog, DialogType, DialogFooter, PrimaryButton, Dropdown, Toggle } from '@fluentui/react';

import configData from "../../config.json";
import IStartScannerBody from '../../models/IStartScannerBody';

export default class StartCCDSScannerDialog extends React.Component<any, any> {
    public state = {
        startingScanner: false,
        force: false,
        library: "",
        useExistingPackageName: false,
        loading: false,
    };

    private async startScanning() {
        this.setState({
            startingScanner: true,
        });

        const body: IStartScannerBody = {
            scanner_id: this.props.scannerId,
            scanner_parameters: {
                library: this.state.library
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
                        startingScanner: false,
                    });
                    this.props.onStarted();
                }
            });
    }

    public render() {
        const libraryChoices = [
            { key: "bi_docuvera_dev", text: "bi_docuvera_dev" }, 
            { key: "bi_test_rnd", text: "bi_test_rnd" }, 
            { key: "bi_dv_development", text: "bi_dv_development" },
        ];
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
                <Dropdown
                    disabled={this.state.loading || this.state.startingScanner}
                    label="Library"
                    options={libraryChoices}
                    onChange={(event: any, option: any) => { this.setState({ library: option ? option.text : "" }) }}
                />
                <Toggle label="Force" defaultChecked={this.state.force} onText="On" offText="Off" onChange={() => this.setState({ force: !this.state.force })} />

                <DialogFooter>
                    <PrimaryButton disabled={this.state.startingScanner && this.state.library === ""} onClick={() => this.startScanning()} text="Start Scanner" />
                </DialogFooter>
            </Dialog>
        );
    }
};
