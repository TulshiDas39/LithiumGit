import { ICommitInfo, ILastCommitByRemote } from ".";
import { StringUtils } from "../utils";

export interface IBranchDetails{
    _id:string;
    name:string;
    commits:ICommitInfo[];
    LastCommitsByRemotes:ILastCommitByRemote[];
    noDerivedCommits:boolean;
    parentCommit?:ICommitInfo;
    drawOrder:number;
    y:number;
    maxRefCount:number;
    increasedHeightForDetached:number;
    verticalOffset:number;
}

export function createBranchDetailsObj(){
    const branchDetails:IBranchDetails={
        _id:StringUtils.uuidv4(),
        name:"",
        LastCommitsByRemotes:[],
        commits:[],
        noDerivedCommits:false,
        drawOrder:0,
        y:0,        
        maxRefCount:0,
        increasedHeightForDetached:0,
        verticalOffset:0,
    }
    return branchDetails;
}