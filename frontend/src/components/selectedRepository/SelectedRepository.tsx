import React from "react";
import { useMultiState } from "../../lib";
import { ISelectedRepoTabItem, SelectedRepoLeft } from "./SelectedRepoLeft";
import { SelectedRepoRight } from "./selectedRepoRight";
import { SelectedRepoRight2 } from "./selectedRepoRight/SelectedRepoRight2";
import './SelectedRepository.scss';

interface IState{
    selectedTab:ISelectedRepoTabItem;
    leftWidth:number;
}

function SelectedRepositoryComponent(){
    const[state,setState]=useMultiState<IState>({selectedTab:{text:"Branches",type:"Branches"},leftWidth:200});
    const handleSelect = (tab:ISelectedRepoTabItem)=>{
        setState({selectedTab:tab});
    }
    return <div id="SelectedRepository" className="d-flex h-100">
        <div style={{width:`${state.leftWidth}px`}}>
            <SelectedRepoLeft  onSelectTab={handleSelect} selectedTab={state.selectedTab} />
        </div>
        <div style={{width:`calc(100% - ${state.leftWidth}px)`}}>
            <SelectedRepoRight2 selectedTab={state.selectedTab.type} />
        </div>
    </div>
}

export const SelectedRepository = React.memo(SelectedRepositoryComponent);