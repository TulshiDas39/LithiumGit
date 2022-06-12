import { combineReducers } from '@reduxjs/toolkit';
import {createSelectorHook} from 'react-redux';
import { ReducerModals, ReducerRepository, ReducerSavedData } from './slices';
import { ReducerUI } from './slices/UiSlice';
const AppReducer = combineReducers({
    savedData:ReducerSavedData,
    ui:ReducerUI,
    modal:ReducerModals,
    repository:ReducerRepository,
});

const AppResetActionType = 'app/Reset';
export const ActionAppReset = (): { type: string } => ({ type: AppResetActionType });

export const RootReducer: (...param: Parameters<typeof AppReducer>) => ReturnType<typeof AppReducer> = (state, action) => {
  if (action.type === AppResetActionType) {
    //AuthStorage.clearLoginData();
    state = undefined;
  }
  return AppReducer(state, action);
}

export type ReduxState= ReturnType<typeof AppReducer>;


export const useSelectorTyped = createSelectorHook<ReduxState>();
