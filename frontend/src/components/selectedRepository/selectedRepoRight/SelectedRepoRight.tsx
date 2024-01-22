import React from "react"
import { BranchesView } from "./branches/BranchesView"
import { Changes } from "./changes"

function SelectedRepoRightComponent(){        
    return <div className="d-flex w-100 h-100">
        <Changes />
        <BranchesView />
    </div>    
}

export const SelectedRepoRight = React.memo(SelectedRepoRightComponent);