import { ICommitInfo, ILastCommitByRemote } from ".";
export interface IBranchDetails {
    name: string;
    commits: ICommitInfo[];
    LastCommitsByRemotes: ILastCommitByRemote[];
    noDerivedCommits: boolean;
    parentCommit: ICommitInfo;
    serial: number;
    y: number;
}
