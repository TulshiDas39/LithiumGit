import { ICommitInfo, IRepositoryDetails } from "common_library";
import React, { useEffect, useRef } from "react"
import { useMultiState } from "../../../../lib";
import { BranchActions } from "./BranchActions";
import { BranchPanel2 } from "./BranchPanel2";
import { CommitProperty } from "./CommitProperty";

interface IBranchesViewProps{
    repoDetails?:IRepositoryDetails;
    selectedCommit?:ICommitInfo;
    onCommitSelect:(commit:ICommitInfo)=>void;
}

interface IState{
    branchPanelWidth:number;
}

function BranchesViewComponent(props:IBranchesViewProps){
    const [state,setState]=useMultiState<IState>({
        branchPanelWidth:-1,
    })
    const branchPanelRef = useRef<HTMLDivElement>();
    useEffect(()=>{
        if(branchPanelRef.current){
            const width = Math.floor(branchPanelRef.current.getBoundingClientRect().width);
            if(state.branchPanelWidth !== width)
                setState({branchPanelWidth:width});
        }
    },[branchPanelRef.current])
    return <div id="selectedRepoRight" className="d-flex w-100 flex-column">
    <BranchActions />
    <div className="d-flex w-100 overflow-hidden">
        <div ref={branchPanelRef as any} className="w-75">
            {(!!props.repoDetails && state.branchPanelWidth !== -1) && <BranchPanel2 containerWidth={state.branchPanelWidth-10} repoDetails={props.repoDetails} selectedCommit={props.selectedCommit} onCommitSelect={props.onCommitSelect} />}
        </div>
        <div className="w-25 ps-2">
            {!!props.selectedCommit && <CommitProperty selectedCommit={props.selectedCommit} />}
        </div>
    </div>
</div>   
}

export const BranchesView = React.memo(BranchesViewComponent);