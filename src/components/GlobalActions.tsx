import * as React from 'react';
import { Stack, Pivot, PivotItem, IconButton, IStackTokens, IIconProps, IStackStyles } from '@fluentui/react';
import { NeutralColors, SharedColors } from '@fluentui/theme';
import logo from '../Logo_INC.png';

const stackTokens: IStackTokens = { childrenGap: 15 };
const stackStyles: Partial<IStackStyles> = {
  root: {
    width: '100%',
    color: '#605e5c',
    padding: "10px",
    backgroundColor: NeutralColors.white,
    boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)",
    position: "sticky",
    top: 0,
    zIndex: 500,
  },
};

const signOutIcon: IIconProps = { iconName: 'SignOut' };

export default class GlobalActions extends React.Component<any, any> {
  public state = {
    selectedKey: "documents"
  }

  public render() {
    return (
      <Stack horizontal styles={stackStyles} tokens={stackTokens} >
        <Stack>
          <img style={{ height: "50px" }} src={logo} alt="logo" />
        </Stack>
        <Stack grow verticalAlign='center' horizontal tokens={stackTokens}>
          <Pivot
            style={{ width: "100%" }}
            selectedKey={this.state.selectedKey}
            onLinkClick={(item?: PivotItem) => {
              if (item) {
                this.setState({
                  selectedKey: item.props.itemKey!
                }, () => this.props.onKeyChanged(this.state.selectedKey)
                )
              }
            }}
          >
            <PivotItem headerText="Version Control" itemIcon="BuildQueueNew" itemKey="versions" />
            <PivotItem headerText="Staging Area" itemIcon="BulkUpload" itemKey="stagingArea" />
            <PivotItem headerText="Similarity Calculations" itemIcon="BranchCompare" itemKey="similarityCalculation" />
            <PivotItem headerText="Sanner" itemIcon="SearchAndApps" itemKey="scanner" />
          </Pivot>
        </Stack>
        <Stack horizontal verticalAlign='center' tokens={stackTokens}>
          <IconButton disabled={this.props.loading} styles={{ icon: { color: SharedColors.red10 } }} iconProps={signOutIcon} title="Sign out" ariaLabel="Sign out" onClick={() => { this.props.logout(); }} />
        </Stack>
      </Stack>
    );
  }
};
