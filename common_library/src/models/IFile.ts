import { EnumChangeType } from "../enums";

export interface IFile{
    fileName:string;
    path:string;
    changeType:EnumChangeType;
}