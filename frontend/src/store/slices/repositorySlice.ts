import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RepositoryInfo } from "common_library";

interface IRepositoryInitialState{
    repositoryDetailsVersion:number,
    selectedRepo?:RepositoryInfo;
}

const initialState:IRepositoryInitialState={
    repositoryDetailsVersion:0,
}

const slice = createSlice({
    initialState:initialState,
    name:"repository",
    reducers:{
        setRepositoryDetails(state){
            state.repositoryDetailsVersion++;
        }
    }
})

export const ActionRepositoy = slice.actions;
export const ReducerRepository = slice.reducer;