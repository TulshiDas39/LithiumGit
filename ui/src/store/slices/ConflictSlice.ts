import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface IData{
    totalConflict:number;
    resolvedConflict:number;
}

const initialState:IData={
 resolvedConflict:0,
 totalConflict:0
}

const slice = createSlice({
    initialState,
    name:"conflict",
    reducers:{
        updateData(state,action:PayloadAction<Partial<IData>>){
            return {...state, ...action.payload};            
        }
    }
})

export const ActionConflict = slice.actions;
export const ReducerConflict = slice.reducer;