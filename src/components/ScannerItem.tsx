import * as React from 'react';
import { Stack, Text, PrimaryButton } from '@fluentui/react';
import { NeutralColors, SharedColors } from '@fluentui/theme';

import StartStagingScannerDialog from './Dialogs/StartStagingScannerDialog';
import StartCCDSScannerDialog from './Dialogs/StartCCDSScannerDialog';


export default class ScannerItem extends React.Component<any, any> {
    public state = {
        error: false,
        errorMessage: "",
        loading: false,
        showStartScannerDialog: false,
        scannerStarted: false,
    };

    public render() {
        return (
            <div style={{
                margin: '0 auto',
                width: "auto",
                minWidth: 500,
                color: '#605e5c',
                padding: 20,
                backgroundColor: NeutralColors.white,
                boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)",
            }}>
                <Text variant='large'>{this.props.title}</Text>
                {
                    this.state.scannerStarted ?
                        <Text variant='medium' color={SharedColors.green20}>Scanner started successfull.</Text>
                        :
                        null
                }
                <Stack>
                    <PrimaryButton style={{ width: 200, marginTop: 20 }} text='Start Scanner' onClick={() => this.setState({ showStartScannerDialog: true })} />
                </Stack>
                {
                    this.props.scannerId === "staging_scanner"
                        ?
                        <StartStagingScannerDialog
                            hidden={!this.state.showStartScannerDialog}
                            scannerName={this.props.title}
                            token={this.props.token}
                            scannerId={this.props.scannerId}
                            timedOutSession={() => this.props.timedOutSession()}
                            onDismiss={() => this.setState({ showStartScannerDialog: false })}
                            onStarted={() => {
                                this.setState({ showStartScannerDialog: false, scannerStarted: true });
                                setTimeout(() => {
                                    this.setState({ scannerStarted: false });
                                }, 3000);
                            }}
                        />
                        :
                        <StartCCDSScannerDialog
                            hidden={!this.state.showStartScannerDialog}
                            scannerName={this.props.title}
                            token={this.props.token}
                            scannerId={this.props.scannerId}
                            timedOutSession={() => this.props.timedOutSession()}
                            onDismiss={() => this.setState({ showStartScannerDialog: false })}
                            onStarted={() => {
                                this.setState({ showStartScannerDialog: false, scannerStarted: true });
                                setTimeout(() => {
                                    this.setState({ scannerStarted: false });
                                }, 3000);
                            }}
                        />
                }
            </div>
        );
    }
};
