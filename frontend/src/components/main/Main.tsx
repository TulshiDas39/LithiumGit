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

interface IMainComponentProps{
    height:number;
}

interface IState{
    isLoading:boolean;
}

const initialState = {
    isLoading:true,
} as IState;

function MainComponent(props:IMainComponentProps){
    const dispatch = useDispatch();
    const store = useSelectorTyped(state=>({
        selectedRepo:state.savedData.recentRepositories.find(x=>x.isSelected),
    }),shallowEqual);
    const [state,setState] = useMultiState(initialState);

    const registerIpcEvents=()=>{
        window.ipcRenderer.on(RendererEvents.showError().channel,(e,message:any)=>{
            const str = typeof message === 'string'?message:JSON.stringify(message);
            ModalData.errorModal.message = str;
            dispatch(ActionUI.setLoader(undefined));
            dispatch(ActionModals.showModal(EnumModals.ERROR));
        })
    }

    useEffect(()=>{
        registerIpcEvents();
        ReduxUtils.setLoader = (payload:ILoaderInfo | undefined)=>{
            dispatch(ActionUI.setLoader(payload));
        }
        const savedData:ISavedData = window.ipcRenderer.sendSync(RendererEvents.getSaveData().channel);
        dispatch(ActionSavedData.updateAutoStaging(savedData.configInfo.autoStage));
        const repos = savedData.recentRepositories;
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

        ReduxUtils.setStatusCurrent = (status:IStatus)=>{
            let current = "";
            if(status.isDetached) current = BranchUtils.repositoryDetails.headCommit.avrebHash+"(Detached)";
            else current = status.current!;
            dispatch(ActionRepositoy.setBranchStatusCurrent(current));
            dispatch(ActionRepositoy.setAheadBehindStatus({ahead:status.ahead,behind:status.behind}));

            const requiredReload = BranchGraphUtils.isRequiredReload(status);
            dispatch(ActionUI.setStatus(new ObjectUtils().deepClone(status)));
            if(requiredReload) dispatch(ActionUI.increamentVersion("branchPanelRefresh"));
            else BranchGraphUtils.checkForUiUpdate(status);
        }

        window.ipcRenderer.on(RendererEvents.pull().replyChannel,(_)=>{
            dispatch(ActionUI.setLoader(undefined));
        })

        window.ipcRenderer.on(RendererEvents.push().replyChannel,(_)=>{
            dispatch(ActionUI.setLoader(undefined));
        })

        window.ipcRenderer.on(RendererEvents.fetch().replyChannel,(_)=>{
            dispatch(ActionUI.setLoader(undefined));
        })

        window.ipcRenderer.on(RendererEvents.refreshBranchPanel().channel,()=>{
            dispatch(ActionUI.increamentVersion("branchPanelRefresh"));
        })

        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getRepositoryDetails().replyChannel]);
            UiUtils.removeIpcListeners([RendererEvents.refreshBranchPanel().channel]);
        }

    },[]);
    if(state.isLoading) return null;
    return <div className="h-100">
        {store.selectedRepo ? <SelectedRepository repo={store.selectedRepo} height={props.height} />:<RepositorySelection />}
    </div>
}

export const Main = React.memo(MainComponent);