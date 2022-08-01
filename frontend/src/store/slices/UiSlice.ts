import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IStatus } from "common_library";
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
}

const initialState:IUIState={
    homePageTab:EnumHomePageTab.Recent,
    versions:{
        branchPanelRefresh:0,
        branchPanelZoom:0,
        appFocused:0,
        branchPanelHome:0,
        repoDetails:0,
    },    
    selectedRepoTab:EnumSelectedRepoTab.BRANCHES,
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
            else state.changes = {currentStep:1,totalStep:action.payload};
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
        }
    }
});

export const ActionUI = UISlice.actions;
export const ReducerUI = UISlice.reducer;