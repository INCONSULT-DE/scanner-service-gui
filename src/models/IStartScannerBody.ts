export default interface IStartScannerBody {
    scanner_id: string,
    scanner_parameters: {
        entry_point?: string,
        package_name?: string,
        use_existing_package?: boolean
        library?: string
    },
    force: boolean
}