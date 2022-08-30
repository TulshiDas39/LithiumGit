import { IRepositoryDetails, ISavedData, IStatus, RendererEvents,RepositoryInfo } from "common_library";
import React from "react";
import { useEffect } from "react";
import {useDispatch,shallowEqual, batch} from "react-redux";
import { BranchUtils, CacheUtils, EnumModals, ObjectUtils, ReduxUtils, UiUtils, useMultiState } from "../../lib";
import { BranchGraphUtils } from "../../lib/utils/BranchGraphUtils";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionModals, ActionRepositoy, ActionSavedData } from "../../store/slices";
import { ActionUI, EnumHomePageTab, ILoaderInfo } from "../../store/slices/UiSlice";
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
            dispatch(ActionUI.setLoader(undefined));
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
                    ReduxUtils.setStatusCurrent(res.status);
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
        ReduxUtils.setLoader = (payload:ILoaderInfo | undefined)=>{
            dispatch(ActionUI.setLoader(payload));
        }
        const savedData:ISavedData = window.ipcRenderer.sendSync(RendererEvents.getSaveData().channel);
        dispatch(ActionSavedData.updateAutoStaging(savedData.configInfo.autoStage));
        console.log("savedData",savedData)
        const repos = savedData.recentRepositories;
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
            console.log("res",res);        
            ReduxUtils.setStatusCurrent(res.status);
            BranchUtils.getRepoDetails(res);
            BranchUtils.repositoryDetails = res;                    
            CacheUtils.setRepoDetails(res);
            BranchGraphUtils.createBranchPanel();
            BranchGraphUtils.insertNewBranchGraph();

        });

        ReduxUtils.setStatusCurrent = (status:IStatus)=>{
            let current = "";
            if(status.isDetached) current = BranchUtils.repositoryDetails.headCommit.avrebHash+"(Detached)";
            else current = status.current!;
            dispatch(ActionRepositoy.setBranchStatusCurrent(current));
            dispatch(ActionRepositoy.setAheadBehindStatus({ahead:status.ahead,behind:status.behind}));

            const requiredReload = BranchGraphUtils.isRequiredReload(status);
            console.log("requiredReload",requiredReload);
            dispatch(ActionUI.setStatus(new ObjectUtils().deepClone(status)));
            if(requiredReload) dispatch(ActionUI.increamentVersion("branchPanelRefresh"));
            else BranchGraphUtils.checkForUiUpdate(status);
        }

        window.ipcRenderer.on(RendererEvents.pull().replyChannel,(_)=>{
            console.log("pull reply");
            dispatch(ActionUI.setLoader(undefined));
        })

        window.ipcRenderer.on(RendererEvents.push().replyChannel,(_)=>{
            console.log("pull reply");
            dispatch(ActionUI.setLoader(undefined));
        })

        window.ipcRenderer.on(RendererEvents.fetch().replyChannel,(_)=>{
            console.log("fetch reply");
            dispatch(ActionUI.setLoader(undefined));
        })

        window.ipcRenderer.on(RendererEvents.refreshBranchPanel().channel,()=>{
            console.log("refreshing branch panel");
            dispatch(ActionUI.increamentVersion("branchPanelRefresh"));
        })

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