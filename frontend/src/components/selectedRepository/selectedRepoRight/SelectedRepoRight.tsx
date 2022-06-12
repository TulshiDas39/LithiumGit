import { ICommitInfo, IRepositoryDetails, RendererEvents } from "common_library"
import produce from "immer"
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
        if(state.repoDetails){
            UiUtils.updateHeadCommit = (commitInfo:ICommitInfo)=>{
                const newRepoDetails = produce(state.repoDetails!,(draftData)=>{
                    draftData.headCommit.isHead = false;                
                    draftData.headCommit = draftData.allCommits.find(x=>x.hash === commitInfo.hash)!;
                    draftData.headCommit.isHead = true;
                });
                setState({repoDetails:newRepoDetails});
            }
        }
        
    },[state.repoDetails])

    useEffect(()=>{
        if(!store.refreshVersion) return;
        setState({repoDetails:undefined});
        getRepoDetails();
    },[store.refreshVersion]);
    
    return <div className="d-flex w-100 h-100">
        {props.selectedTab === "Changes" && <Changes repoInfo={state.repoDetails?.repoInfo} />}
        {props.selectedTab === "Branches" && <BranchesView onCommitSelect ={c=>setState({selectedCommit:c})} repoDetails={state.repoDetails} 
        selectedCommit={state.selectedCommit}   />}
    </div>    
}

export const SelectedRepoRight = React.memo(SelectedRepoRightComponent);