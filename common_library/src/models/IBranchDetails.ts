import { ICommitInfo, ILastCommitByRemote } from ".";

export interface IBranchDetails{
    name:string;
    commits:ICommitInfo[];
    LastCommitsByRemotes:ILastCommitByRemote[];
    noDerivedCommits:boolean;
    parentCommit?:ICommitInfo;
    serial:number;
    y:number;
    // Group uiObj;
}

export function createBranchDetailsObj(){
    const branchDetails:IBranchDetails={
        name:"",
        LastCommitsByRemotes:[],
        commits:[],
        noDerivedCommits:false,
        serial:0,
        y:0
    }
    return branchDetails;
}