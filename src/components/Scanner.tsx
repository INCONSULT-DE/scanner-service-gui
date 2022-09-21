import * as React from 'react';
import { Stack, IStackTokens, IStackStyles, } from '@fluentui/react';
import { NeutralColors } from '@fluentui/theme';

import ScannerItem from './ScannerItem';

const stackTokens: IStackTokens = { childrenGap: 10 };
const containerStyles: Partial<IStackStyles> = {
    root: {
        margin: '0 auto',
        width: "100%",
        color: '#605e5c',
        padding: 10,
    },
};

export default class Scanner extends React.Component<any, any> {
    public state = {
        error: false,
        errorMessage: "",
        loading: false,
    };

    public render() {
        return (
            <Stack horizontal tokens={stackTokens} styles={containerStyles}>
                <ScannerItem title="Viva" />
                <ScannerItem title="File Share" />
            </Stack>
        );
    }
};
