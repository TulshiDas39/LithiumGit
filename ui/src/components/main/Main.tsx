import { ISavedData, RendererEvents } from "common_library";
import React from "react";
import { useEffect } from "react";
import {useDispatch,shallowEqual, batch} from "react-redux";
import { DataUtils, EnumModals, FetchState, GraphUtils, ReduxUtils, RepoUtils, UiUtils, useMultiState } from "../../lib";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionModals, ActionSavedData } from "../../store/slices";
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
    }),shallowEqual);
    const [state,setState] = useMultiState(initialState);

    const registerIpcEvents=()=>{
        window.ipcRenderer.on(RendererEvents.showError().channel,(e,message:any)=>{
            const str = typeof message === 'string'?message:JSON.stringify(message);
            ModalData.errorModal.message = str;
            dispatch(ActionUI.clearLoaders());
            dispatch(ActionUI.setSync(undefined));
            dispatch(ActionModals.showModal(EnumModals.ERROR));
        })
    }

    useEffect(()=>{
        registerIpcEvents();        
        const savedData:ISavedData = window.ipcRenderer.sendSync(RendererEvents.getSaveData().channel);
        if(!savedData){
            batch(()=>{
                dispatch(ActionSavedData.deSelectRepo());
                dispatch(ActionUI.setHomePageTab(EnumHomePageTab.Open));
            });
        }
        dispatch(ActionSavedData.updateAutoStaging(savedData.configInfo.autoStage));
        const repos = savedData.recentRepositories;        
        if(!repos?.length){
            setState({isLoading:false});
            dispatch(ActionUI.setHomePageTab(EnumHomePageTab.Open));
            return;
        }
        RepoUtils.selectedRepo = repos.find(_=> _.isSelected)!;
        const sortedRepos = repos.sort((x1,x2)=> (x1.lastOpenedAt ?? "") > (x2.lastOpenedAt ?? "") ?-1:1);
        batch(()=>{
            dispatch(ActionSavedData.setRecentRepositories(sortedRepos));
            if(!repos.length) dispatch(ActionUI.setHomePageTab(EnumHomePageTab.Open));
        });
        setState({isLoading:false});        

        window.ipcRenderer.on(RendererEvents.refreshBranchPanel().channel,()=>{
            dispatch(ActionUI.setSync({text:"Refreshing..."}));
            GraphUtils.refreshGraph();
        })

        window.ipcRenderer.on(RendererEvents.cloneProgress,(_e,progress:number,stage:FetchState)=>{            
            DataUtils.clone.stage = stage;
            DataUtils.clone.progress = progress;
        })

        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.refreshBranchPanel().channel]);
        }

    },[]);
    if(state.isLoading) return null;
    return <div className="h-100">
        {store.selectedRepo ? <SelectedRepository repo={store.selectedRepo} />:<RepositorySelection />}
    </div>
}

export const Main = React.memo(MainComponent);