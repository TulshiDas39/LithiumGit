import { IBranchDetails, ICommitInfo, IRepositoryDetails, RendererEvents } from "common_library"
import React, { useEffect } from "react"
import { shallowEqual } from "react-redux"
import { BranchUtils, UiUtils, useMultiState } from "../../../lib"
import { useSelectorTyped } from "../../../store/rootReducer"
import { BranchActions } from "./BranchActions"
import { BranchPanel } from "./BranchPanel"
import { CommitProperty } from "./CommitProperty"

interface IState{
    selectedCommit?:ICommitInfo;
    repoDetails?:IRepositoryDetails;
}

function SelectedRepoRightComponent(){
    const [state,setState] = useMultiState<IState>({});

    const store = useSelectorTyped(state=>({
        selectedRepo:state.savedData.recentRepositories.find(x=>x.isSelected),
    }),shallowEqual);

    useEffect(()=>{
        window.ipcRenderer.send(RendererEvents.getRepositoryDetails().channel,store.selectedRepo);
        window.ipcRenderer.on(RendererEvents.getRepositoryDetails().replyChannel,(e,res:IRepositoryDetails)=>{
            BranchUtils.getRepoDetails(res);            
            setState({repoDetails:res,selectedCommit:res.headCommit});
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getRepositoryDetails().replyChannel]);
        }
    },[]);
    
    return <div id="selectedRepoRight" className="d-flex flex-column flex-grow-1">
        <BranchActions />
        <div className="d-flex w-100 overflow-hidden">
            <div className="w-75">
                <BranchPanel repoDetails={state.repoDetails} selectedCommit={state.selectedCommit} onCommitSelect={(c)=>setState({selectedCommit:c})} />
            </div>
            <div className="w-25 ps-2">
                <CommitProperty selectedCommit={state.selectedCommit} />
            </div>
        </div>
    </div>   
}

export const SelectedRepoRight = React.memo(SelectedRepoRightComponent);