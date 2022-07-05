import React, {  } from "react"

interface IBranchPanelProps{
    // onCommitSelect:(commit:ICommitInfo)=>void;
    // selectedCommit?:ICommitInfo;
    containerWidth:number;
}

function BranchPanelComponent(props:IBranchPanelProps){
    const panelHeight = 400;
    
    // if(!props.repoDetails) return <span className="d-flex justify-content-center w-100">Loading...</span>;
    
    return <div id="branchPanel" className="w-100" style={{overflow:'hidden'}}>
        
    </div>
}

export const BranchPanel2 = React.memo(BranchPanelComponent);