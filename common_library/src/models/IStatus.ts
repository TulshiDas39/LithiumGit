import { ICommitInfo } from "./ICommitInfo";
import { IFile } from "./IFile";

export interface IStatus{
    ahead:number;
    behind:number;
    staged:IFile[];
    unstaged:IFile[];
    conflicted:IFile[];
    renamed:{
        from:string;
        to:string;
    }[];
    isClean:boolean;
    current:string | null;
    isDetached:boolean;
    headCommit:ICommitInfo;
    mergingCommitHash?:string;
    trackingBranch?:string;
}

export interface IChanges{
    created:IFile[];
    modified:IFile[];
    deleted:IFile[];
}