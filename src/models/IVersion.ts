export default interface IVersion {
    id: number,
    name: string,
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