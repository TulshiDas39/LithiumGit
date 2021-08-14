import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RendererEvents, RepositoryInfo } from "common_library";

export enum EnumHomePageTab{
    Recent="Recents",
    Open="Open",
    Create="Create",
    Clone="Clone",
}

// export type EnumHomePageTab="Recents"|"Open"|"Create"|"Clone";

interface IUIState{
    homePageTab:EnumHomePageTab;
}

const initialState:IUIState={
    homePageTab:EnumHomePageTab.Recent,
}

const UISlice = createSlice({
    initialState:initialState,
    name:"SavedData",
    reducers:{
        setHomePageTab(state,action:PayloadAction<EnumHomePageTab>){
            state.homePageTab = action.payload;
        }        
    }
});

export const ActionUI = UISlice.actions;
export const ReducerUI = UISlice.reducer;