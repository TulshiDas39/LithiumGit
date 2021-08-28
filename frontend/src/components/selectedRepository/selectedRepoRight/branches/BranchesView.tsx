import { ICommitInfo, IRepositoryDetails } from "common_library";
import React from "react"
import { BranchActions } from "./BranchActions";
import { BranchPanel } from "./BranchPanel";
import { CommitProperty } from "./CommitProperty";

interface IBranchesViewProps{
    repoDetails?:IRepositoryDetails;
    selectedCommit?:ICommitInfo;
    onCommitSelect:(commit:ICommitInfo)=>void;
}

function BranchesViewComponent(props:IBranchesViewProps){
    return <div id="selectedRepoRight" className="d-flex flex-column flex-grow-1">
    <BranchActions />
    <div className="d-flex w-100 overflow-hidden">
        <div className="w-75">
            {!!props.repoDetails && <BranchPanel repoDetails={props.repoDetails} selectedCommit={props.selectedCommit} onCommitSelect={props.onCommitSelect} />}
        </div>
        <div className="w-25 ps-2">
            {!!props.selectedCommit && <CommitProperty selectedCommit={props.selectedCommit} />}
        </div>
    </div>
</div>   
}

export const BranchesView = React.memo(BranchesViewComponent);