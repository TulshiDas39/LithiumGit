import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RepositoryInfo } from "common_library";

interface IRepositoryInitialState{
    repositoryDetailsVersion:number,
    selectedRepo?:RepositoryInfo;
    statusCurrent:string;
}

const initialState:IRepositoryInitialState={
    repositoryDetailsVersion:0,
    statusCurrent:"",
}

const slice = createSlice({
    initialState:initialState,
    name:"repository",
    reducers:{
        setRepositoryDetails(state){
            state.repositoryDetailsVersion++;
        },
        setBranchStatusCurrent(state,action:PayloadAction<string>){
            state.statusCurrent = action.payload;
        }
    }
})

export const ActionRepositoy = slice.actions;
export const ReducerRepository = slice.reducer;