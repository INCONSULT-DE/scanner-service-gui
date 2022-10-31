import * as React from 'react';
import { Text } from '@fluentui/react';


export default class PropertyAndValueText extends React.Component<any, any> {
    public render() {
        return (
            <p><Text variant="mediumPlus"><b>{this.props.property}:</b> {this.props.value}</Text></p>
        );
    }
};
