import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RepositoryInfo } from "common_library";

interface ISavedData{
    recentRepositories:RepositoryInfo[];
}

const initialState:ISavedData={
    recentRepositories:[],
}

const SavedDataSlice = createSlice({
    initialState:initialState,
    name:"SavedData",
    reducers:{
        setRecentRepositories(state,action:PayloadAction<RepositoryInfo[]>){
            state.recentRepositories = action.payload;
        }
    }
});

export const ActionSavedData = SavedDataSlice.actions;
export const ReducerSavedData = SavedDataSlice.reducer;