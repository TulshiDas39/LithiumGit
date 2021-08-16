import React from "react"
import { BranchActions } from "./BranchActions"
import { BranchPanel } from "./BranchPanel"

function SelectedRepoRightComponent(){
    return <div className="d-flex flex-column">
        <BranchActions />
        <BranchPanel />
    </div>   
}

export const SelectedRepoRight = React.memo(SelectedRepoRightComponent);