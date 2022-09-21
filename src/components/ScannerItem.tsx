import * as React from 'react';
import { Stack, IStackTokens, IStackStyles, Text, PrimaryButton } from '@fluentui/react';
import { NeutralColors } from '@fluentui/theme';

const stackTokens: IStackTokens = { childrenGap: 10 };
const scannerBoxStyles: Partial<IStackStyles> = {
    root: {
        margin: '0 auto',
        width: "100%",
        color: '#605e5c',
        padding: 10,
        backgroundColor: NeutralColors.white,
        boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)",
    },
};

export default class ScannerItem extends React.Component<any, any> {
    public state = {
        error: false,
        errorMessage: "",
        loading: false,
    };

    public render() {
        return (
            <Stack horizontal horizontalAlign='space-between' tokens={stackTokens} styles={scannerBoxStyles}>
                <Stack>
                    <Text variant='large'>{this.props.title}</Text>
                    <Text variant='medium'>Stauts: currently not running</Text>
                    <Text variant='medium'>Last run: 12.09.2022</Text>
                </Stack>
                <PrimaryButton text='Start Scanner' />
            </Stack>
        );
    }
};
