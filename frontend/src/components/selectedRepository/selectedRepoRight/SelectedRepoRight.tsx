import React from "react"
import { BranchesView } from "./branches/BranchesView"
import { Changes } from "./changes"

interface ISelectedRepoRightProps{
    height:number;
}

function SelectedRepoRightComponent(props:ISelectedRepoRightProps){        
    return <div className="d-flex w-100 h-100">
        <Changes height={props.height} />
        <BranchesView />
    </div>    
}

export const SelectedRepoRight = React.memo(SelectedRepoRightComponent);