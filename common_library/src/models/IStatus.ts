import { IFile } from "./IFile";

export interface IStatus{
    ahead:number;
    behind:number;
    created:IFile[];
    conflicted:IFile[];
    deleted:IFile[];
    modified:IFile[];
    renamed:{
        from:string;
        to:string;
    }[];
    staged:IFile[];
    not_added: IFile[];
    isClean:boolean;
    current:string | null;
    isDetached:boolean;
}
