import * as React from 'react';
import { Stack, Text, TextField, PrimaryButton, Spinner, FontWeights, IStackTokens, IStackStyles, ITextFieldStyles, ITextStyles } from '@fluentui/react';
import { SharedColors, NeutralColors } from '@fluentui/theme';
import logo from '../Logo_INC.png';
import './Login.css';
import configData from "../config.json";

const boldStyle: Partial<ITextStyles> = { root: { fontWeight: FontWeights.semibold } };
const stackTokens: IStackTokens = { childrenGap: 15 };
const stackStyles: Partial<IStackStyles> = {
    root: {
        margin: '0 auto',
        marginTop: 40,
        padding: 40,
        textAlign: 'center',
        color: '#605e5c',
        backgroundColor: NeutralColors.white,
        boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)",
    },
};

const stackStylesContentContainer: Partial<IStackStyles> = {
    root: {
        width: '100%',
        margin: '0 auto',
        color: '#605e5c',
        backgroundColor: NeutralColors.gray10,
    },
};
const textFieldStyles: Partial<ITextFieldStyles> = {
    root: {
        width: '300px'
    }
};

const errorMessageStyle: Partial<ITextStyles> = {
    root: { color: SharedColors.red10 }
};

export default class Login extends React.Component<any, any> {
    public state = {
        loggingIn: false,
        username: "",
        password: "",
        loginFailed: false,
    };


    public render() {
        return (
            <Stack verticalFill styles={stackStylesContentContainer} tokens={stackTokens}>
                <Stack horizontalAlign="center" verticalAlign="center" styles={stackStyles} tokens={stackTokens}>
                    <img className="App-logo" style={{ marginTop: "20px" }} src={logo} alt="logo" />
                    <Text variant="xxLarge" styles={boldStyle}>
                        Welcome to the Similarity Servive UI
                    </Text>
                    <Text variant="large">Please log in to continue.</Text>
                    <TextField onKeyUp={(event) => this.onEnterPressed(event)} onChange={(event, value) => this.setState({ username: value })} label="User" styles={textFieldStyles} disabled={this.state.loggingIn} required />
                    <TextField onKeyUp={(event) => this.onEnterPressed(event)} onChange={(event, value) => this.setState({ password: value })} label="Password" styles={textFieldStyles} type="password" canRevealPassword disabled={this.state.loggingIn} required />
                    {this.state.loginFailed ? <Text styles={errorMessageStyle} variant="large">Login failed. Please try again.</Text> : null}
                    {this.props.timedOut && !this.state.loginFailed && !this.state.loggingIn ? <Text styles={errorMessageStyle} variant="large">Your session timed out. Please login again.</Text> : null}
                    {
                        this.state.loggingIn ?
                            <Spinner label="Logging in..." />
                            :
                            <PrimaryButton text="Login" onClick={() => this.login()} allowDisabledFocus disabled={this.state.loggingIn || this.state.username === "" || this.state.password === ""} />
                    }
                </Stack>
            </Stack>
        );
    }

    private onEnterPressed(event: any) {
        if (event.key === "Enter") {
            this.login();
        }
    }

    private login(): void {
        this.setState({ loggingIn: true });

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": this.state.username,
                "password": this.state.password
            })
        };

        fetch(configData.SERVER_URL + 'auth/login', requestOptions)
            .then(async response => {
                const isJson = response.headers.get('content-type')?.includes('application/json');
                const data = isJson && await response.json();
                // check for error response
                if (!response.ok) {
                    this.setState({ loginFailed: true, loggingIn: false });
                } else {
                    window.sessionStorage.setItem("similarity_auth_token",data.auth_token)
                    this.props.loginSucceded(data.auth_token);
                }
            })
            .catch(error => {
                this.setState({ loginFailed: true, loggingIn: false });
            });
    }
};
