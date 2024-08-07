import { IFile } from "./IFile";

export interface IStash{
    message:string;
    body:string;
    date:string;
    authorName:string;
    authEmail:string;
    hash:string;
    avrebHash:string;
    changedCount:number;
    index:number;
    insertion:number;
    deletion:number;
}