import * as React from 'react';
import { Stack, IStackTokens, MessageBar, MessageBarButton, MessageBarType } from '@fluentui/react';
import { NeutralColors } from '@fluentui/theme';
import configData from "../config.json";

import GlobalActions from '../components/GlobalActions';
import VersionList from '../components/VersionList';
import SimilarityCalculationList from '../components/SimilarityCalculationList';
import Scanner from '../components/Scanner';
import FileUpload from '../components/FileUpload';

const stackTokens: IStackTokens = { childrenGap: 10 };

export default class ApplicationOverview extends React.Component<any, any> {
    public state = {
        error: false,
        errorMessage: "",
        displayScreen: "versions",
    }

    private renderContentArea() {
        switch (this.state.displayScreen) {
            case "versions":
                return <VersionList
                    token={this.props.token}
                    timedOutSession={() => this.props.timedOutSession()}
                    onErrorHappened={() => this.setState({ error: true, errorMessage: "Sorry, we had a problem while loading the documents! Please reload the page and retry.", })}
                />;
            case "fileupload":
                return <FileUpload
                    token={this.props.token}
                    timedOutSession={() => this.props.timedOutSession()}
                    onErrorHappened={() => this.setState({ error: true, errorMessage: "Sorry, we had a problem while uploading the files! Please reload the page and retry.", })}
                />;
            case "similarityCalculation":
                return <SimilarityCalculationList
                    token={this.props.token}
                    timedOutSession={() => this.props.timedOutSession()}
                    onErrorHappened={() => this.setState({ error: true, errorMessage: "Sorry, we had a problem while loading the similarity caluclations! Please reload the page and retry.", })}
                />;
            case "scanner":
                return <Scanner
                    token={this.props.token}
                    timedOutSession={() => this.props.timedOutSession()}
                    onErrorHappened={() => this.setState({ error: true, errorMessage: "Sorry, we had a problem reaching the scanner! Please reload the page and retry.", })}
                />;
        }
    }
    public render() {
        const ErrorBar = (
            <MessageBar
                actions={
                    <div>
                        <MessageBarButton onClick={() => window.location.reload()}>Reload Page</MessageBarButton>
                    </div>
                }
                messageBarType={MessageBarType.error}
                isMultiline={false}
                style={{ position: "absolute" }}
            >
                {this.state.errorMessage}
            </MessageBar>
        );

        const content = this.renderContentArea();
        return (
            <Stack verticalFill tokens={stackTokens} style={{
                width: "100%",
                backgroundColor: NeutralColors.gray10,
            }}>
                {this.state.error ? ErrorBar : null}
                <GlobalActions
                    logout={() => this.signOut()}
                    onKeyChanged={(key: string) => this.setState({ displayScreen: key })}
                />
                <Stack style={{ width: "100%", }} horizontalAlign="center" horizontal tokens={stackTokens}>
                    {content}
                </Stack>
            </Stack>
        );
    }

    private signOut(): void {
        this.setState({ loading: true });
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.props.token
            },

        };

        fetch(configData.SERVER_URL + 'auth/logout', requestOptions)
            .then(async response => {
                const isJson = response.headers.get('content-type')?.includes('application/json');
                const data = isJson && await response.json();
                // check for error response
                if (!response.ok) {
                    // todo Error Handling
                } else {

                    if (data.status === "success") {
                        this.props.loggedOut();
                    }
                }
            })
            .catch(error => {
                console.error(error);
                this.setState({
                    error: true,
                    errorMessage: "Sorry, we had a problem while logging you out! Please reload the page and retry.",
                    loading: false,
                });
            });
    }
};
