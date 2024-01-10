import { ICommitInfo } from "./ICommitInfo";
import { IFile } from "./IFile";

export interface IStatus{
    ahead:number;
    behind:number;
    stagedChanges:IChanges;
    unstagedChanges:IChanges;
    created:IFile[];
    conflicted:IFile[];
    deleted:IFile[];
    modified:IFile[];
    renamed:{
        from:string;
        to:string;
    }[];
    staged:IFile[];
    not_staged: IFile[];
    isClean:boolean;
    current:string | null;
    isDetached:boolean;
    headCommit:ICommitInfo;
    mergingCommitHash?:string;
}

export interface IChanges{
    created:IFile[];
    modified:IFile[];
    deleted:IFile[];
}