export interface INewVersionInfo{
    version:string;
    downloaded?:boolean;
}

export interface IFileProps{
    sizeKB:number;
    path:string;
}

export interface IChange{
    lineIndex:number;
    offset:number;
    text:string;
    deleteCount:number;
}

export interface IAppData{
    dataPath:string;
}