import { ICommitInfo } from "common_library"
import React from "react"
import { useMultiState } from "../../../lib"
import { BranchActions } from "./BranchActions"
import { BranchPanel } from "./BranchPanel"
import { CommitProperty } from "./CommitProperty"

interface IState{
    selectedCommit?:ICommitInfo;
}

function SelectedRepoRightComponent(){
    const [state,setState] = useMultiState<IState>({});
    return <div id="selectedRepoRight" className="d-flex flex-column flex-grow-1">
        <BranchActions />
        <div className="d-flex w-100 overflow-hidden">
            <BranchPanel selectedCommit={state.selectedCommit} onCommitSelect={(c)=>setState({selectedCommit:c})} />
            <CommitProperty selectedCommit={state.selectedCommit} />
        </div>
    </div>   
}

export const SelectedRepoRight = React.memo(SelectedRepoRightComponent);