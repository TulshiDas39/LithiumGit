import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { EnumChangeGroup, IFile } from "common_library";

interface IData{
    selectedFile?:IFile;
    currentStep:number;
    totalStep:number;
    silentStepUpdate:boolean;
    selectedTab:EnumChangeGroup;
    stepRefreshVersion:number;
}

const initialState:IData={
    currentStep:0,
    totalStep:0,
    silentStepUpdate:false,
    selectedTab:EnumChangeGroup.UN_STAGED,
    stepRefreshVersion:0,
}

const slice = createSlice({
    initialState,
    name:"changes",
    reducers:{
        updateData(state,action:PayloadAction<Partial<IData>>){
            const newState = {...state, ...action.payload};
            if(newState.currentStep > newState.totalStep)
                newState.currentStep = newState.totalStep;
            return newState;
        },
        increamentStepRefreshVersion(state){
            state.stepRefreshVersion += 1;
            state.silentStepUpdate = false;
        }
    }
})

export const ActionChanges = slice.actions;
export const ReducerChanges = slice.reducer;