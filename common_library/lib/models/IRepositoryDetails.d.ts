import { IBranchDetails, ICommitInfo, ILastReference, IRemoteInfo } from ".";
import { RepositoryInfo } from "../schemas";
export interface IRepositoryDetails {
    allCommits: ICommitInfo[];
    branchDetails: IBranchDetails;
    lastReferencesByBranch: ILastReference[];
    uniqueBrancNames: string[];
    remotes: IRemoteInfo[];
    branchTree: IBranchDetails[];
    resolvedBranches: IBranchDetails[];
    headCommit: ICommitInfo;
    mergeCommitMessages: string[];
    sourceCommits: ICommitInfo[];
    repoInfo: RepositoryInfo;
}
