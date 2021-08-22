import { ICommitInfo, IRepositoryDetails } from "common_library";
import React from "react"
import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { useMultiState } from "../../../lib";
import { useSelectorTyped } from "../../../store/rootReducer";
import { SingleBranch } from "./SingleBranch";

interface IBranchPanelProps{
    onCommitSelect:(commit:ICommitInfo)=>void;
    selectedCommit?:ICommitInfo;
    repoDetails?:IRepositoryDetails;
}

interface IState{
    scale:number;
}

function BranchPanelComponent(props:IBranchPanelProps){
    const store = useSelectorTyped(state=>({
        zoom:state.ui.versions.branchPanelZoom,
    }),shallowEqual);
    useEffect(()=>{
        if(props.repoDetails?.headCommit) {
            let elmnt = document.getElementById(props.repoDetails.headCommit.hash);
            if(elmnt) elmnt.scrollIntoView();            
        }
    },[props.repoDetails?.headCommit])

    useEffect(()=>{
        setState({scale:1+ (store.zoom/10)});
    },[store.zoom])

    const [state,setState]=useMultiState<IState>({scale:1});

    if(!props.repoDetails) return <span className="d-flex justify-content-center w-100">Loading...</span>;
    console.log(props.repoDetails);
    return <div id="branchPanel" className="w-100 overflow-scroll">
            <svg width={props.repoDetails.branchPanelWidth} height={props.repoDetails.branchPanelHeight} style={{transform:`scale(${state.scale})`}}>
                <g>
                    {
                        props.repoDetails.mergedLines.map(line=>(
                            <line key={`${line.srcX}-${line.srcY}-${line.endX}-${line.endY}`} x1={line.srcX} y1={line.srcY} x2={line.endX} y2={line.endY} stroke="green" strokeWidth={1} />
                        ))
                    }
                    {
                        props.repoDetails.resolvedBranches.map(branch=>(
                            <SingleBranch key={branch._id} branchDetails ={branch} onCommitSelect={props.onCommitSelect} selectedCommit={props.selectedCommit} />
                        ))
                    }                                        
                </g>
            </svg>
    </div>
}

export const BranchPanel = React.memo(BranchPanelComponent);