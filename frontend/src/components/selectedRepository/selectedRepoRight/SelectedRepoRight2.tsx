import React from "react"
import { ISelectedRepoTabItem } from "../SelectedRepoLeft"
import { BranchesView2 } from "./branches/BranchesView2"
import { Changes } from "./changes"

interface ISelectedRepoRightProps{
}

function SelectedRepoRightComponent(props:ISelectedRepoRightProps){        
    return <div className="d-flex w-100 h-100">
        <Changes />
        <BranchesView2 />
    </div>    
}

export const SelectedRepoRight2 = React.memo(SelectedRepoRightComponent);