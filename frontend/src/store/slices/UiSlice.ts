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
}

interface IUIState{
    homePageTab:EnumHomePageTab;
    versions:EventVersions;    
}

const initialState:IUIState={
    homePageTab:EnumHomePageTab.Recent,
    versions:{
        branchPanelRefresh:0,
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
        }
    }
});

export const ActionUI = UISlice.actions;
export const ReducerUI = UISlice.reducer;