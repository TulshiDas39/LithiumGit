import React from "react"
import { BranchActions } from "./BranchActions"
import { BranchPanel } from "./BranchPanel"

function SelectedRepoRightComponent(){
    return <div className="d-flex flex-column flex-nowrap">
        <BranchActions />
        <BranchPanel />
    </div>   
}

export const SelectedRepoRight = React.memo(SelectedRepoRightComponent);