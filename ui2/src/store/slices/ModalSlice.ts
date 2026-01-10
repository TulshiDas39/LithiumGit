import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EnumModals } from "../../lib";

export interface IModalData{
    openedModals:EnumModals[];
    
}

const initialState:IModalData = {
    openedModals:[],
}

const slice = createSlice({
    initialState:initialState,
    name:"Modal",
    reducers:{
        showModal(state,action:PayloadAction<EnumModals>){
            state.openedModals.push(action.payload);
        },
        hideModal(state,action:PayloadAction<EnumModals>){
            state.openedModals = state.openedModals.filter(m=>m !== action.payload);
        },
        showToast(state){
            state.openedModals.push(EnumModals.TOAST);
        },
    }
});


export const ActionModals = slice.actions;
export const ReducerModals = slice.reducer;