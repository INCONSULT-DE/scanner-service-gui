export default interface ISelectedFile { 
    iconName: string;
    key: string;
    value: string;
    name: string,
    fileSizeRaw: number,
    fileSize: string,
    fileType: string,
    lastModified: number,
    lastModifiedDate: Date,
    fileExtension: string,
    lastModifiedLocaleString: string,
    file: File, 
    status: SelectedFileStatus,
}

export enum SelectedFileStatus {
    Prepared = "Prepared for Upload",
    Uploaded = "Uploaded",
    LifeCycleStarted= "Lifecycle started"
}