import { ICommitInfo } from "./ICommitInfo";

export interface IHeadCommitInfo extends ICommitInfo{
    isDetached:boolean;
}