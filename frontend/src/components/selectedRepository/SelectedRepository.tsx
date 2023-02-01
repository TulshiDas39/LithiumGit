import React from "react";
import { useMultiState } from "../../lib";
import { SelectedRepoLeft } from "./SelectedRepoLeft";
import { SelectedRepoRight2 } from "./selectedRepoRight/SelectedRepoRight2";
import './SelectedRepository.scss';


interface ISelectedRepositoryProps{
    height:number;
}

interface IState{
    leftWidth:number;
}

function SelectedRepositoryComponent(props:ISelectedRepositoryProps){
    const[state,setState]=useMultiState<IState>({leftWidth:200});
    // const handleSelect = (tab:ISelectedRepoTabItem)=>{
    //     setState({selectedTab:tab});
    // }
    return <div id="SelectedRepository" className="d-flex h-100">
        <div style={{width:`${state.leftWidth}px`}}>
            <SelectedRepoLeft height={props.height}  />
        </div>
        <div style={{width:`calc(100% - ${state.leftWidth}px)`}}>
            <SelectedRepoRight2 height={props.height} />
        </div>
    </div>
}

export const SelectedRepository = React.memo(SelectedRepositoryComponent);