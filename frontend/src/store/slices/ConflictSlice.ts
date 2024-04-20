import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IFile } from "common_library";

interface IData{

}

const initialState:IData={
 
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