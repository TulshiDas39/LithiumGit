import { configureStore } from "@reduxjs/toolkit";
import { RootReducer } from "./rootReducer";




export const ReduxStore = configureStore({
    reducer: RootReducer,
    devTools: process.env.NODE_ENV === 'development',
});

export function getStoreState(){
    return ReduxStore.getState();
}