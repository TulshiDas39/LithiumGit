import { IBranchDetails, ICommitInfo, ILastReference, IRemoteInfo } from ".";
import { RepositoryInfo } from "../schemas";

export interface IRepositoryDetails{
    allCommits:ICommitInfo[];
    branchDetails:IBranchDetails;
    lastReferencesByBranch:ILastReference[];
    uniqueBrancNames:string[];
    remotes:IRemoteInfo[];
    branchTree:IBranchDetails[];
    resolvedBranches:IBranchDetails[];
    headCommit:ICommitInfo;
    mergeCommitMessages:string[];
    sourceCommits:ICommitInfo[];
    repoInfo:RepositoryInfo;
    branchPanelHeight:number;
    branchPanelWidth:number;
    // Group branchPanel;
    // Line selectedMergeLine;
}

export function CreateRepositoryDetails(){
    const obj:IRepositoryDetails={
        allCommits:[],
        branchDetails:null!,
        branchTree:[],
        headCommit:null!,
        lastReferencesByBranch:[],
        uniqueBrancNames:[],
        mergeCommitMessages:[],
        remotes:[],
        repoInfo:null!,
        resolvedBranches:[],
        sourceCommits:[],
        branchPanelHeight:0,
        branchPanelWidth:0,
    }
    return obj;
}