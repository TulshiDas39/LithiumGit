import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IFile } from "common_library";

interface IData{
    selectedFile?:IFile;
    currentStep:number;
    totalStep:number;
}

const initialState:IData={
    currentStep:0,
    totalStep:0
}

const slice = createSlice({
    initialState,
    name:"clone",
    reducers:{
        updateData(state,action:PayloadAction<Partial<IData>>){
            return {...state, ...action.payload};            
        }
    }
})

export const ActionConflict = slice.actions;
export const ReducerConflict = slice.reducer;