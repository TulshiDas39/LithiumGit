import React from "react"
import { ISelectedRepoTabItem } from "../SelectedRepoLeft"
import { BranchesView2 } from "./branches/BranchesView2"
import { Changes } from "./changes"

interface ISelectedRepoRightProps{
    selectedTab:ISelectedRepoTabItem["type"];
}

function SelectedRepoRightComponent(props:ISelectedRepoRightProps){        
    return <div className="d-flex w-100 h-100">
        {props.selectedTab === "Changes" && <Changes />}
        {props.selectedTab === "Branches" && <BranchesView2  />}
    </div>    
}

export const SelectedRepoRight2 = React.memo(SelectedRepoRightComponent);