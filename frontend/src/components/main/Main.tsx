import { IRepositoryDetails, RendererEvents,RepositoryInfo } from "common_library";
import React from "react";
import { useEffect } from "react";
import {useDispatch,shallowEqual, batch} from "react-redux";
import { BranchUtils, CacheUtils, EnumModals, UiUtils, useMultiState } from "../../lib";
import { BranchGraphUtils } from "../../lib/utils/BranchGraphUtils";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionModals, ActionSavedData } from "../../store/slices";
import { ActionUI, EnumHomePageTab } from "../../store/slices/UiSlice";
import { ModalData } from "../modals/ModalData";
import { RepositorySelection } from "../repositorySelection";
import { SelectedRepository } from "../selectedRepository";

interface IState{
    isLoading:boolean;
}

const initialState = {
    isLoading:true,
} as IState;

function MainComponent(){
    const dispatch = useDispatch();
    const store = useSelectorTyped(state=>({
        selectedRepo:state.savedData.recentRepositories.find(x=>x.isSelected),
        branchPanelRefreshVersion:state.ui.versions.branchPanelRefresh,
    }),shallowEqual);
    const [state,setState] = useMultiState(initialState);

    const registerIpcEvents=()=>{
        window.ipcRenderer.on(RendererEvents.showError().channel,(e,message:any)=>{
            const str = typeof message === 'string'?message:JSON.stringify(message);
            console.log("str",str);
            ModalData.errorModal.message = str;
            dispatch(ActionModals.showModal(EnumModals.ERROR));
        })
    }

    const getRepoDetails=()=>{            
        window.ipcRenderer.send(RendererEvents.getRepositoryDetails().channel,store.selectedRepo);        
    }
    
    useEffect(()=>{               
        if(store.selectedRepo) {
            CacheUtils.getRepoDetails(store.selectedRepo.path).then(res=>{
                if(res) {
                    BranchUtils.repositoryDetails = res;
                    // setState({repoDetails:res,selectedCommit:res.headCommit});

                    // dispatch(ActionUI.increamentVersion("repoDetails"));
                    BranchGraphUtils.createBranchPanel();
                    BranchGraphUtils.insertNewBranchGraph();
                }
                else getRepoDetails();
            });
        }
        // else getRepoDetails();

        

    },[store.selectedRepo]);

    useEffect(()=>{
        if(!store.branchPanelRefreshVersion) return;
        // setState({repoDetails:undefined});
        getRepoDetails();
    },[store.branchPanelRefreshVersion]); 

    useEffect(()=>{
        registerIpcEvents();
        const repos:RepositoryInfo[] =  window.ipcRenderer.sendSync(RendererEvents.getRecentRepositoires); 
        console.log('repos',repos);
        if(!repos?.length){
            setState({isLoading:false});
            dispatch(ActionUI.setHomePageTab(EnumHomePageTab.Open));
            return;
        }
        const sortedRepos = repos.sort((x1,x2)=> (x1.lastOpenedAt ?? "") > (x2.lastOpenedAt ?? "") ?-1:1);
        batch(()=>{
            
            dispatch(ActionSavedData.setRecentRepositories(sortedRepos));
            if(!repos.length) dispatch(ActionUI.setHomePageTab(EnumHomePageTab.Open));
        });
        setState({isLoading:false});

        window.ipcRenderer.on(RendererEvents.getRepositoryDetails().replyChannel,(e,res:IRepositoryDetails)=>{
            BranchUtils.getRepoDetails(res);
            BranchUtils.repositoryDetails = res;        
            CacheUtils.setRepoDetails(res);
            BranchGraphUtils.createBranchPanel();
            BranchGraphUtils.insertNewBranchGraph();

        });

        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getRepositoryDetails().replyChannel]);
            UiUtils.removeIpcListeners([RendererEvents.refreshBranchPanel().channel]);
        }

    },[]);
    if(state.isLoading) return null;
    return <div className="h-100">
        {store.selectedRepo ? <SelectedRepository />:<RepositorySelection />}
    </div>
}

export const Main = React.memo(MainComponent);