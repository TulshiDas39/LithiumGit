import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IFile, IRemoteInfo, IStatus } from "common_library";
import { BranchGraphUtils, EnumSelectedRepoTab } from "../../lib";

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
}

interface IChangesState{
    totalStep:number;
    currentStep:number;
}

export interface ILoaderInfo{
    text:string;
}

interface IUIState{
    homePageTab:EnumHomePageTab;
    versions:EventVersions;
    changes?:IChangesState;
    selectedRepoTab:EnumSelectedRepoTab;
    loader?:ILoaderInfo;
    mergerCommitMessage?:string;
    status?:IStatus;
    selectedFile?:IFile;
    remotes:IRemoteInfo[];
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
    },    
    selectedRepoTab:EnumSelectedRepoTab.BRANCHES,
    changes:{
        currentStep:0,
        totalStep:1,
    },
    remotes:[],
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
        setTotalComparable(state,action:PayloadAction<number>){
            if(state.changes)state.changes.totalStep = action.payload;
            else state.changes = {currentStep:action.payload,totalStep:action.payload};
        },
        setComparableStep(state,action:PayloadAction<number>){
            state.changes!.currentStep = action.payload;
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
        setSelectedFile(state,action:PayloadAction<IFile|undefined>){
            state.selectedFile = action.payload;
        },
        setRemotes(state,action:PayloadAction<IRemoteInfo[]>){
            state.remotes = action.payload;
        }
    }
});

export const ActionUI = UISlice.actions;
export const ReducerUI = UISlice.reducer;