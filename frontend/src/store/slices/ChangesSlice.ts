import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { EnumChangeGroup, IFile } from "common_library";

interface IData{
    selectedFile?:IFile;
    currentStep:number;
    totalStep:number;
    selectedTab:EnumChangeGroup;
    stepRefreshVersion:number;
}

const initialState:IData={
    currentStep:0,
    totalStep:0,
    selectedTab:EnumChangeGroup.UN_STAGED,
    stepRefreshVersion:0,
}

const slice = createSlice({
    initialState,
    name:"changes",
    reducers:{
        updateData(state,action:PayloadAction<Partial<IData>>){
            return {...state, ...action.payload};            
        },
        increamentStepRefreshVersion(state){
            state.stepRefreshVersion += 1;
        }
    }
})

export const ActionChanges = slice.actions;
export const ReducerChanges = slice.reducer;