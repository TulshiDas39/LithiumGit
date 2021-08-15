import { IBranchDetails, IBranchRemote } from ".";

export interface ICommitInfo{
    hash:string;
    avrebHash:string;
    branchesFromThis:IBranchDetails[];
    parentHashes:string[];  
    ownerBranch:IBranchDetails;
    referedBranches:string[];
    branchNameWithRemotes:IBranchRemote[] ;
    nextCommit:ICommitInfo;
    previousCommit:ICommitInfo ;
    date:string;
    message:string;
    refs:string;
    body:string;
    author_name:string;
    author_email:string;
    x:number;
    y:number;
    // SingleCommit UiObj;
}