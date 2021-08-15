import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RendererEvents, RepositoryInfo } from "common_library";

interface ISavedData{
    recentRepositories:RepositoryInfo[];
}

const initialState:ISavedData={
    recentRepositories:[],
}

const SavedDataSlice = createSlice({
    initialState:initialState,
    name:"SavedData",
    reducers:{
        setRecentRepositories(state,action:PayloadAction<RepositoryInfo[]>){
            state.recentRepositories = action.payload;
        },
        setSelectedRepository(state,action:PayloadAction<RepositoryInfo>){
            const updatedList:RepositoryInfo[]=[];            
            const existingSelected = state.recentRepositories.find(x=>x.isSelected);
            if(existingSelected) {
                existingSelected.isSelected = false;
                updatedList.push({...existingSelected});
            }
            let newSelected = state.recentRepositories.find(x=>x.path === action.payload.path);
            if(!newSelected) {
                newSelected = action.payload;
            }
            newSelected.isSelected = true;
            newSelected.lastOpenedAt = new Date().toISOString();
            updatedList.push({...newSelected});

            window.ipcRenderer.send(RendererEvents.updateRepositories,updatedList);
        },
        deSelectRepo(state){
            const selectedRepos = state.recentRepositories.filter(x=>x.isSelected);
            if(selectedRepos.length) {
                selectedRepos.forEach(rep=>{
                    rep.isSelected = false;                    
                });                 
                window.ipcRenderer.send(RendererEvents.updateRepositories,selectedRepos.map(rep=>({...rep})));
            }
        }

    }
});

export const ActionSavedData = SavedDataSlice.actions;
export const ReducerSavedData = SavedDataSlice.reducer;