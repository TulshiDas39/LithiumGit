import { IRepositoryDetails, RendererEvents } from "common_library";
import React from "react"
import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { BranchUtils, UiUtils, useMultiState } from "../../../lib";
import { useSelectorTyped } from "../../../store/rootReducer";
interface IState{
    repoDetails:IRepositoryDetails;
}

function BranchPanelComponent(){
    const store = useSelectorTyped(state=>({
        selectedRepo:state.savedData.recentRepositories.find(x=>x.isSelected),
    }),shallowEqual);

    const [state,setState] = useMultiState<IState>({repoDetails:null!});
    
    useEffect(()=>{
        window.ipcRenderer.send(RendererEvents.getRepositoryDetails().channel,store.selectedRepo);
        window.ipcRenderer.on(RendererEvents.getRepositoryDetails().replyChannel,(e,res:IRepositoryDetails)=>{
            BranchUtils.getRepoDetails(res);
            setState({repoDetails:res});
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getRepositoryDetails().replyChannel]);
        }
    },[]);

    if(!state.repoDetails) return <span>Loading...</span>;
    console.log(state.repoDetails);
    return <div>

    </div>
}

export const BranchPanel = React.memo(BranchPanelComponent);