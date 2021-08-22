import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
}

interface IUIState{
    homePageTab:EnumHomePageTab;
    versions:EventVersions;    
}

const initialState:IUIState={
    homePageTab:EnumHomePageTab.Recent,
    versions:{
        branchPanelRefresh:0,
        branchPanelZoom:0,
    },    
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
        increamentBranchPanelZoom(state){
            if(state.versions.branchPanelZoom < 10) state.versions.branchPanelZoom += 1;
        },
        decreamentBranchPanelZoom(state){
            if(state.versions.branchPanelZoom > -9) state.versions.branchPanelZoom -= 1;
        },
        resetBranchPanelZoom(state){
            state.versions.branchPanelZoom = 0;
        }
    }
});

export const ActionUI = UISlice.actions;
export const ReducerUI = UISlice.reducer;