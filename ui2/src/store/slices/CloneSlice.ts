//CloneSlice

import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CloneState, FetchState } from "../../lib";

interface ICloneData{
    url:string;
    directory:string;
    cloningState:CloneState;
    progress:number;
    progressLabel:FetchState;
    projectFolder:string;
}

const initialState:ICloneData={
    url:"",
    directory:"",
    cloningState:CloneState.NotStarted,
    progress:0,
    progressLabel:FetchState.Remote,
    projectFolder:"",
}

const slice = createSlice({
    initialState,
    name:"clone",
    reducers:{
        updateData(state,action:PayloadAction<Partial<ICloneData>>){
            return {...state, ...action.payload};            
        }
    }
})

export const ActionClone = slice.actions;
export const ReducerClone = slice.reducer;