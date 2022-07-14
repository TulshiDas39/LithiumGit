import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RepositoryInfo } from "common_library";

interface IRepositoryInitialState{
    repositoryDetailsVersion:number,
    selectedRepo?:RepositoryInfo;
    statusCurrent:string;
    aheadCount:number;
    behindCount:number;
}

const initialState:IRepositoryInitialState={
    repositoryDetailsVersion:0,
    statusCurrent:"",
    aheadCount:0,
    behindCount:0,
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
        },
        setAheadBehindStatus(state,action:PayloadAction<{ahead:number;behind:number}>){
            state.aheadCount=action.payload.ahead;
            state.behindCount=action.payload.behind;
        }
    }
})

export const ActionRepositoy = slice.actions;
export const ReducerRepository = slice.reducer;