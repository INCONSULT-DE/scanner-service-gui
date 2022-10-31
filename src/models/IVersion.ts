import { IContextualMenuProps } from "@fluentui/react";
import { ReactElement } from "react";


export default interface IVersion {
    id: number,
    key: number;
    name: string,
    status: string,
    modified: Date,
    modifiedLocaleString: string,
    created: Date,
    createdLocaleString: string,
    documentId: number,
}

export interface IVersionDetails{
    doc_metadata: Array<any>,
    id: number,
    name: string,
    source_checksum: string,
    source_metadata: Object,
    source_reference: string,
    status: Object,
}