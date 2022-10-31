import * as React from 'react';
import { Text, Separator } from '@fluentui/react';
import PropertyAndValueText from './PropertyAndValueText';

import configData from "../config.json";
import { IVersionDetails } from '../models/IVersion';

export default class VersionDetails extends React.Component<any, any> {
    public state = {
        error: false,
        errorMessage: "",
        loading: false,
        item: new Array<IVersionDetails>(),
    };

    public componentDidMount() {
        this.loadDetails();
    }

    private async loadDetails() {
        this.setState({ loading: true });
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.props.token
            }
        };
        fetch(configData.SERVER_URL + '/version/' + this.props.selectedItem.id, requestOptions)
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
                    const renderedDocMetadata = data.data[0].doc_metadata.properties.map((item: any) => { return <p key={item.name}><b>{item.name}:</b> {item.value}</p> })

                    const renderedSourceMetadata = new Array<any>();
                    for (let [key, value] of Object.entries(data.data[0].source_metadata)) {
                        renderedSourceMetadata.push(<p key={key}><b>{key}:</b> {value}</p>)
                    }

                    const renderedStatus = new Array<any>();
                    for (let [key, value] of Object.entries(data.data[0].status)) {
                        renderedStatus.push(<p key={key}><b>{key}:</b> {value}</p>)
                    }


                    const versionDetails = new Array<IVersionDetails>();
                    versionDetails.push({
                        doc_metadata: renderedDocMetadata,
                        id: data.data[0].id,
                        name: data.data[0].name,
                        source_checksum: data.data[0].source_checksum,
                        source_metadata: renderedSourceMetadata,
                        source_reference: data.data[0].source_reference,
                        status: renderedStatus,
                    });

                    this.setState({
                        loading: false,
                        item: versionDetails
                    });
                }
            })
            .catch(error => {
                console.error(error);
                this.props.onErrorHappened();
                this.setState({ loading: true, });
            });
    }

    public render() {
        return (this.state.item.length > 0 ?
            <div>
                <Separator />
                <PropertyAndValueText property="ID" value={this.state.item[0].id} />
                <PropertyAndValueText property="Name" value={this.state.item[0].name} />
                <PropertyAndValueText property="Source Checksum" value={this.state.item[0].source_checksum} />
                <PropertyAndValueText property="Source Reference" value={this.state.item[0].source_reference} />
                <Separator />
                <Text variant="mediumPlus"><b>Source Metadata:</b></Text>
                <div style={{
                    boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)", padding: 10, marginTop: 10
                }}>{this.state.item[0].source_metadata}</div>
                <Separator />
                <Text variant="mediumPlus"><b>Status:</b></Text>
                <div style={{
                    boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)", padding: 10, marginTop: 10
                }}>{this.state.item[0].status}</div>
                <Separator />
                <Text variant="mediumPlus"><b>Doument Metadata:</b></Text>
                <div style={{
                    boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)", padding: 10, marginTop: 10
                }}>{this.state.item[0].doc_metadata}</div>
            </div> :
            null
        );
    }
};
