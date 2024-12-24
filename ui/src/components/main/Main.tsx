import { EnumNotificationType, EnumTheme, ISavedData, RendererEvents } from "common_library";
import React from "react";
import { useEffect } from "react";
import {useDispatch,shallowEqual, batch} from "react-redux";
import { DataUtils, EnumModals, FetchState, GraphUtils, IUiNotification, RepoUtils, UiUtils, useMultiState } from "../../lib";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionModals, ActionSavedData } from "../../store/slices";
import { ActionUI, EnumHomePageTab } from "../../store/slices/UiSlice";
import { ModalData } from "../modals/ModalData";
import { RepositorySelection } from "../repositorySelection";
import { SelectedRepository } from "../selectedRepository";
import { IpcUtils } from "../../lib/utils/IpcUtils";
import { getStoreState } from "../../store";

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
        notificationLoadV:state.ui.versions.notifications, 
        appFocusV:state.ui.versions.appFocused,
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

    const setTheme=(theme:EnumTheme)=>{
        window.document.documentElement.setAttribute("data-theme",theme);
    }

    const loadNotifications=()=>{
        IpcUtils.getNotifications().then(r=>{
            if(!r.error){
                dispatch(ActionUI.setNotificationList(r.result!));
            }
        })
    }

    useEffect(()=>{
        loadNotifications();
    },[store.notificationLoadV])

    useEffect(()=>{
        const checkInterValMinute = 2*24*60;
        const now = new Date();
        const config = getStoreState().savedData.configInfo;
        const lastChecked = config.checkedForUpdateAt;
        const nextCheckDate = new Date(lastChecked);
        nextCheckDate.setMinutes(nextCheckDate.getMinutes() + checkInterValMinute);
        console.log(now.toISOString(),nextCheckDate.toISOString());
        if(nextCheckDate < now){
            console.log("checking for update.");
            IpcUtils.checkForUpdate().then(r=>{
                dispatch(ActionSavedData.updateConfig({...config,checkedForUpdateAt: now.toISOString()}));
            });
        }
    },[store.appFocusV])

    useEffect(()=>{
        registerIpcEvents();        
        const savedData:ISavedData = window.ipcRenderer.sendSync(RendererEvents.getSaveData().channel);
        if(!savedData){
            batch(()=>{
                dispatch(ActionSavedData.deSelectRepo());
                dispatch(ActionUI.setHomePageTab(EnumHomePageTab.Open));
            });
        }
        else{
            setTheme(savedData.configInfo.theme);
        }
        dispatch(ActionSavedData.updateConfig(savedData.configInfo));
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

        window.ipcRenderer.on(RendererEvents.notification,(_e,notification:IUiNotification)=>{
            if(notification.type === EnumNotificationType.UpdateAvailable){
                const existingNot = getStoreState().ui.notifications.find(_=>_.type === EnumNotificationType.UpdateAvailable);
                if(!existingNot){
                    notification.isActive = true;
                }
            }
            const id = notification._id;
            dispatch(ActionUI.addNotifications([notification]));
            if(notification.isActive){
                setTimeout(() => {
                    dispatch(ActionUI.deactivateNotification(id));
                }, 1000*60);
            }
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