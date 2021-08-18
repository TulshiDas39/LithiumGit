import { ICommitInfo, IRepositoryDetails } from "common_library";
import React from "react"
import { SingleBranch } from "./SingleBranch";

interface IBranchPanelProps{
    onCommitSelect:(commit:ICommitInfo)=>void;
    selectedCommit?:ICommitInfo;
    repoDetails?:IRepositoryDetails;
}

function BranchPanelComponent(props:IBranchPanelProps){        

    if(!props.repoDetails) return <span>Loading...</span>;
    console.log(props.repoDetails);
    return <div id="branchPanel" className="w-100 overflow-scroll">
            <svg width={props.repoDetails.branchPanelWidth} height={props.repoDetails.branchPanelHeight}>
                <g>
                    {
                        props.repoDetails.resolvedBranches.map(branch=>(
                            <SingleBranch key={branch._id} branchDetails ={branch} onCommitSelect={props.onCommitSelect} selectedCommit={props.selectedCommit} />
                        ))
                    }
                    {/* <path d="M100,100 h200" fill="none" stroke="black" stroke-width="2"/>
                    <path d="M100,100 v100 a20,20 0 0 0 20,20 h200" fill="none" stroke="black" stroke-width="2"/>
                    <path d="M100,100 v130 a20,20 0 0 0 20,20 h200" fill="none" stroke="black" stroke-width="2"/>
                    <circle cx="130" cy="250" r="13" stroke="black" stroke-width="3" fill="red" />
                    <circle cx="180" cy="250" r="13" stroke="black" stroke-width="3" fill="red" /> */}

                    {/* <path d="M100,100 h200 a20,20 0 0 1 20,20 v200 a20,20 0 0 1 -20,20 h-200 a20,20 0 0 1 -20,-20 v-200 a20,20 0 0 1 20,-20 z" fill="none" stroke="black" stroke-width="3" /> */}
                    {/* <path d="M100,120 h200 a20,20 0 0 1 20,20 v200 a20,20 0 0 1 -20,20 h-200 a20,20 0 0 1 -20,-20 v-200 a20,20 0 0 1 20,-20 z" fill="none" stroke="black" stroke-width="3" /> */}
                </g>
            </svg>
    </div>
}

export const BranchPanel = React.memo(BranchPanelComponent);