export interface IStagingFolder {
    path: string,
    layerPath: string,
    name: string,
    files: Array<IStagingFile>,
}

export interface IStagingFolderFlatHierarchy {
    path: string,
    name: string,
    subFolder: Array<string> | null 
}

export interface IStagingFile {
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
    status: StagingFileStatus,
}

export enum StagingFileStatus {
    Uploaded = "Uploaded",
    Uploading = "Uploading",
    UploadFailed = "Upload failed",
    LifeCycleStarted = "Lifecycle started"
}