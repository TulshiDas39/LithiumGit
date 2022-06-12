import { createSlice } from "@reduxjs/toolkit";

interface IRepositoryInitialState{
    repositoryDetailsVersion:number,
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