import { ICommitInfo, IRepositoryDetails, RendererEvents } from "common_library"
import React, { useEffect } from "react"
import { shallowEqual } from "react-redux"
import { BranchUtils, CacheUtils, UiUtils, useMultiState } from "../../../lib"
import { useSelectorTyped } from "../../../store/rootReducer"
import { ISelectedRepoTabItem } from "../SelectedRepoLeft"
import { BranchesView } from "./branches"
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

    const store = useSelectorTyped(state=>({
        selectedRepo:state.savedData.recentRepositories.find(x=>x.isSelected),
        refreshVersion:state.ui.versions.branchPanelRefresh,
    }),shallowEqual);

    const getRepoDetails=()=>{            
        window.ipcRenderer.send(RendererEvents.getRepositoryDetails().channel,store.selectedRepo);
        window.ipcRenderer.on(RendererEvents.getRepositoryDetails().replyChannel,(e,res:IRepositoryDetails)=>{
            BranchUtils.getRepoDetails(res);        
            CacheUtils.setRepoDetails(res);
            setState({repoDetails:res,selectedCommit:res.headCommit});
            UiUtils.removeIpcListeners([RendererEvents.getRepositoryDetails().replyChannel]);
        });
    }

    useEffect(()=>{               
        if(store.selectedRepo) {
            CacheUtils.getRepoDetails(store.selectedRepo.path).then(res=>{
                if(res) setState({repoDetails:res,selectedCommit:res.headCommit});
                else getRepoDetails();
            });
        }
        else getRepoDetails();

    },[store.selectedRepo]);

    useEffect(()=>{
        if(!store.refreshVersion) return;
        setState({repoDetails:undefined});
        getRepoDetails();
    },[store.refreshVersion]);
    
    if(props.selectedTab === "Changes") return <Changes repoInfo={state.repoDetails?.repoInfo} />
    return <BranchesView onCommitSelect ={c=>setState({selectedCommit:c})} repoDetails={state.repoDetails} 
        selectedCommit={state.selectedCommit}   />
}

export const SelectedRepoRight = React.memo(SelectedRepoRightComponent);