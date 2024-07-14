import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IRemoteInfo, IStatus } from "common_library";
import { EnumSelectedRepoTab } from "../../lib";

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
}

export interface ILoaderInfo{
    text:string;
}

interface IUIState{
    homePageTab:EnumHomePageTab;
    versions:EventVersions;
    selectedRepoTab:EnumSelectedRepoTab;
    loader?:ILoaderInfo;
    mergerCommitMessage?:string;
    status?:IStatus;
    remotes:IRemoteInfo[];
    branchList:string[];
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
    },    
    selectedRepoTab:EnumSelectedRepoTab.GRAPH,
    remotes:[],
    branchList:[],
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
        setLoader(state,action:PayloadAction<ILoaderInfo|undefined>){
            state.loader = action.payload;
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
        }
    }
});

export const ActionUI = UISlice.actions;
export const ReducerUI = UISlice.reducer;