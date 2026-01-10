import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EnumNotificationType, INotification, IRemoteInfo, IStatus } from "common_library";
import { EnumConfigTab, EnumSelectedRepoTab, IUiNotification } from "../../lib";

export enum EnumHomePageTab{
    Recent="Recents",
    Open="Open",
    Create="Create",
    Clone="Clone",
}

// export type EnumHomePageTab="Recents"|"Open"|"Create"|"Clone";

interface EventVersions{
    branchPanelRefresh:number;
    branchPanelZoom:number;
    appFocused:number;
    branchPanelHome:number;
    repoDetails:number;
    remoteList:number;
    annotations:number;
    notifications:number;
}

export interface ILoaderInfo{
    text:string;
    id:string;
}

export interface ILocalSyncInfo{
    text:string;
}

interface IUIState{
    homePageTab:EnumHomePageTab;
    versions:EventVersions;
    selectedRepoTab:EnumSelectedRepoTab;
    configTab:EnumConfigTab;
    loaders:ILoaderInfo[];
    synch?:ILocalSyncInfo;
    mergerCommitMessage?:string;
    status?:IStatus;
    remotes:IRemoteInfo[];
    branchList:string[];
    refreshingGraph:boolean;
    notifications:IUiNotification[];
}

const initialState:IUIState={
    homePageTab:EnumHomePageTab.Recent,
    versions:{
        branchPanelRefresh:0,
        branchPanelZoom:0,
        appFocused:0,
        branchPanelHome:0,
        repoDetails:0,
        remoteList:0,
        annotations:0,
        notifications:0,
    },    
    selectedRepoTab:EnumSelectedRepoTab.GRAPH,
    remotes:[],
    branchList:[],
    refreshingGraph:false,
    configTab:EnumConfigTab.USER,
    loaders:[],
    notifications:[],
}

const UISlice = createSlice({
    initialState:initialState,
    name:"SavedData",
    reducers:{
        setHomePageTab(state,action:PayloadAction<EnumHomePageTab>){
            state.homePageTab = action.payload;
        },
        increamentVersion(state,action:PayloadAction<keyof EventVersions>){
            state.versions[action.payload] +=1;
        },
        decreamentVersion(state,action:PayloadAction<keyof EventVersions>){
            state.versions[action.payload] -=1;
        },
        setVersion(state,action:PayloadAction<{key:keyof EventVersions,value:number}>){
            state.versions[action.payload.key] = action.payload.value;
        },
        increamentBranchPanelZoom(state,action?:PayloadAction<number|undefined>){
            if(!action?.payload) state.versions.branchPanelZoom += 1;
            else state.versions.branchPanelZoom += action.payload;
        },
        decreamentBranchPanelZoom(state,action?:PayloadAction<number|undefined>){
            if(!action?.payload) state.versions.branchPanelZoom -= 1;
            else state.versions.branchPanelZoom -= action.payload;
        },
        resetBranchPanelZoom(state){
            state.versions.branchPanelZoom = 0;
        },
        setSelectedRepoTab(state,action:PayloadAction<EnumSelectedRepoTab>){
            state.selectedRepoTab = action.payload;
        },
        setConfigTab(state,action:PayloadAction<EnumConfigTab>){
            state.configTab = action.payload;
        },
        setLoader(state,action:PayloadAction<ILoaderInfo>){
            if(!action.payload){
                state.loaders = [];
            }else{
                state.loaders.push(action.payload);
            }
        },
        clearLoaders(state){
            state.loaders = [];
        },
        removeLoader(state,action:PayloadAction<string>){
            state.loaders = state.loaders.filter(_=> _.id !== action.payload);
        },
        setSync(state,action:PayloadAction<ILocalSyncInfo|undefined>){
            state.synch = action.payload;
        },
        setMergerCommitMessage(state,action:PayloadAction<string>){
            state.mergerCommitMessage = action.payload;
        },
        setStatus(state,action:PayloadAction<IStatus>){
            state.status = action.payload;
        },
        setRemotes(state,action:PayloadAction<IRemoteInfo[]>){
            state.remotes = action.payload;
        },
        setBranchList(state,action:PayloadAction<string[]>){
            state.branchList = action.payload;
        },
        setGraphRefresh(state,action:PayloadAction<boolean>){
            state.refreshingGraph = action.payload;
        },
        setNotificationList(state,action:PayloadAction<IUiNotification[]>){
            state.notifications = action.payload;
        },
        addNotifications(state,action:PayloadAction<IUiNotification[]>){
            for(let item of action.payload){
                if(item.type === EnumNotificationType.UpdateAvailable){
                    state.notifications = state.notifications.filter(_ => _.type !== EnumNotificationType.UpdateAvailable);
                }
                state.notifications.push(item);
            }
        },
        removeNotifications(state,action:PayloadAction<IUiNotification[]>){
            for(let item of action.payload){
                state.notifications = state.notifications.filter(_ => _._id !== item._id);
            }
        },
        deactivateNotification(state,action:PayloadAction<string>){
            const notification = state.notifications.find(_=> _._id === action.payload);
            if(notification){
                notification.isActive = false;
            }
        }
    }
});

export const ActionUI = UISlice.actions;
export const ReducerUI = UISlice.reducer;