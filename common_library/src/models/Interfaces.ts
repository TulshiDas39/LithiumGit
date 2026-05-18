export interface INewVersionInfo{
    version:string;
    downloaded?:boolean;
}

export interface IFileProps{
    sizeKB:number;
    path:string;
}

export interface IChange{
    startlineIndex:number;
    endlineIndex:number;
    startOffset:number;
    endOffset:number;
    text:string;
    encoding?:{
        from:string;
        to:string;
    }
}

export interface IAppData{
    dataPath:string;
    tempPath:string;
    encodingList:string[];
}