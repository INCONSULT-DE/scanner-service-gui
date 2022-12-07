import * as React from 'react';
import { Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton, Text } from '@fluentui/react';

export default class OverrideStagingFileDialog extends React.Component<any, any> {
    public render() {
        return (
            <Dialog
                hidden={this.props.hidden}
                onDismiss={() => this.props.onDismiss()}
                dialogContentProps={{
                    type: DialogType.normal,
                    isMultiline: true,
                    title: this.props.title,
                }}
                modalProps={{ isBlocking: true }}
            >
                <Text>{this.props.text}</Text>
                <DialogFooter>
                    <DefaultButton onClick={() => this.props.onDismiss()} text="Cancel" />
                    <PrimaryButton onClick={() => this.props.onConfirm()} text="Override files" />
                </DialogFooter>
            </Dialog>
        );
    }
};
