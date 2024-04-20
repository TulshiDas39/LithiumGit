import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { EnumChangeGroup, IFile } from "common_library";

interface IData{
    selectedFile?:IFile;
    currentStep:number;
    totalStep:number;
    selectedTab?:EnumChangeGroup
}

const initialState:IData={
    currentStep:0,
    totalStep:0
}

const slice = createSlice({
    initialState,
    name:"changes",
    reducers:{
        updateData(state,action:PayloadAction<Partial<IData>>){
            return {...state, ...action.payload};            
        }
    }
})

export const ActionChanges = slice.actions;
export const ReducerChanges = slice.reducer;