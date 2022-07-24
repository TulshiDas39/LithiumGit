import React from "react";
import { EnumSelectedRepoTab, useMultiState } from "../../lib";
import { ISelectedRepoTabItem, SelectedRepoLeft } from "./SelectedRepoLeft";
import { SelectedRepoRight2 } from "./selectedRepoRight/SelectedRepoRight2";
import './SelectedRepository.scss';

interface IState{
    leftWidth:number;
}

function SelectedRepositoryComponent(){
    const[state,setState]=useMultiState<IState>({leftWidth:200});
    // const handleSelect = (tab:ISelectedRepoTabItem)=>{
    //     setState({selectedTab:tab});
    // }
    return <div id="SelectedRepository" className="d-flex h-100">
        <div style={{width:`${state.leftWidth}px`}}>
            <SelectedRepoLeft  />
        </div>
        <div style={{width:`calc(100% - ${state.leftWidth}px)`}}>
            <SelectedRepoRight2 />
        </div>
    </div>
}

export const SelectedRepository = React.memo(SelectedRepositoryComponent);