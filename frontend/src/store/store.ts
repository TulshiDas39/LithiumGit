import { configureStore } from "@reduxjs/toolkit";
import {useDispatch} from 'react-redux';
import { RootReducer } from "./rootReducer";




export const ReduxStore = configureStore({
    reducer: RootReducer,
    devTools: process.env.NODE_ENV === 'development',
});
