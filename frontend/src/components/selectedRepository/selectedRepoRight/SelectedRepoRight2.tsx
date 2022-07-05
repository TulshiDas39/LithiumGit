import { ICommitInfo, IRepositoryDetails } from "common_library"
import React from "react"
import { useMultiState } from "../../../lib"
import { ISelectedRepoTabItem } from "../SelectedRepoLeft"
import { BranchesView2 } from "./branches/BranchesView2"
import { Changes } from "./changes"

interface ISelectedRepoRightProps{
    selectedTab:ISelectedRepoTabItem["type"];
}

interface IState{
    selectedCommit?:ICommitInfo;
    repoDetails?:IRepositoryDetails;
}

function SelectedRepoRightComponent(props:ISelectedRepoRightProps){    

    const [state,setState] = useMultiState<IState>({});

 
   
    
    return <div className="d-flex w-100 h-100">
        {props.selectedTab === "Changes" && <Changes />}
        {props.selectedTab === "Branches" && <BranchesView2 repoDetails={state.repoDetails} />}
    </div>    
}

export const SelectedRepoRight2 = React.memo(SelectedRepoRightComponent);