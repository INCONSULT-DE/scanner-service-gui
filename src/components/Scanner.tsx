import * as React from 'react';
import { Stack, IStackTokens, IStackStyles, } from '@fluentui/react';

import ScannerItem from './ScannerItem';

const stackTokens: IStackTokens = { childrenGap: 20 };
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
      <Stack horizontal horizontalAlign="start" tokens={stackTokens} styles={containerStyles}>
        <Stack.Item>
          <ScannerItem token={this.props.token} title="Docuvera (CCDS)" scannerId="ccds_scanner" timedOutSession={() => this.props.timedOutSession()} />
        </Stack.Item>
        <Stack.Item>
          <ScannerItem token={this.props.token} title="Staging (File Share)" scannerId="staging_scanner" timedOutSession={() => this.props.timedOutSession()} />
        </Stack.Item>
      </Stack>
    );
  }
};
/*

Staging Area


/scanner 
id  
parameter 
force 
entry_point (folder Pfad auswahl)



scanners:
  queue: scanner
  runtime_state: Scanning
  target_state: Scanned
  dummy_scanner:
    scanner_name: Dummy Scanner
  staging_scanner:
    scanner_name: Staging Area
    entry_point:
    mapping:
      Project Name: title
    service_configs:
      default: lifecycle_dev_layer.yml
      supported_file_types:
        - .docx
        - .doc
      metadata_column: Project type
      config_map:
        AR - Product  Information - es: lifecycle_local.yml
        AR - DL - Product Information: lifecycle_dev_layer.yml
        EU PI Annex I - SmPC - en: lifecycle_local.yml
        EU PI Annex II - Manufacturer/Conditions - en: lifecycle_local_no_relation.yml
        EU PI Annex III A1 - Outer and Immediate Packaging - en: lifecycle_local_no_relation.yml
        EU PI Annex III B - Package Leaflet - en: lifecycle_local_no_relation.yml
        EU Centralized Procedure Bundle: lifecycle_bundle.yml
        EU CP - DL - SmPC: lifecycle_dev_layer.yml
        US - Prescribing Information - en: lifecycle_local.yml
        US - Quick Reference Guide - en: lifecycle_local_no_relation.yml
        US - DL - Prescribing Information: lifecycle_dev_layer.yml
        CA - Product Monograph - en: lifecycle_local.yml
        CA - DL - Product Monograph: lifecycle_dev_layer.yml
        Empty Project: lifecycle_test.yml
  ccds_scanner:
    scanner_name: Docuvera Project Scanner
    library: bi_docuvera_dev
    login_user:
    login_pwd:

*/