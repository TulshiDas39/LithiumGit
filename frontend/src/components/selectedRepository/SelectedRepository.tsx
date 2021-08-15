import React from "react";
import { useMultiState } from "../../lib";
import { ISelectedRepoTabItem, SelectedRepoLeft } from "./SelectedRepoLeft";
import './SelectedRepository.scss';

interface IState{
    selectedTab:ISelectedRepoTabItem;
}

function SelectedRepositoryComponent(){
    const[state,setState]=useMultiState<IState>({selectedTab:{text:"Branch Explorer",type:"Branch_Explorer"}});
    const handleSelect = (tab:ISelectedRepoTabItem)=>{
        setState({selectedTab:tab});
    }
    return <div id="SelectedRepository" className="d-flex h-100">
        <SelectedRepoLeft  onSelectTab={handleSelect} selectedTab={state.selectedTab} />
    </div>
}

export const SelectedRepository = React.memo(SelectedRepositoryComponent);