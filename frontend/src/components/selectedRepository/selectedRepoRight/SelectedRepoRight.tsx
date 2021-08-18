import React from "react"
import { BranchActions } from "./BranchActions"
import { BranchPanel } from "./BranchPanel"

function SelectedRepoRightComponent(){
    return <div id="selectedRepoRight" className="d-flex flex-column flex-grow-1">
        <BranchActions />
        <BranchPanel />
    </div>   
}

export const SelectedRepoRight = React.memo(SelectedRepoRightComponent);