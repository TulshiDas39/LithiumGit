import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RendererEvents, RepositoryInfo } from "common_library";

interface ISavedData{
    recentRepositories:RepositoryInfo[];
    autoStagingEnabled:boolean;
}

const initialState:ISavedData={
    recentRepositories:[],
    autoStagingEnabled:false,
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
            if(action.payload.path === existingSelected?.path) return;
            if(existingSelected) {
                existingSelected.isSelected = false;
                updatedList.push({...existingSelected});
            }
            let newSelected = state.recentRepositories.find(x=>x.path === action.payload.path);
            if(!newSelected) {
                newSelected = action.payload;
                state.recentRepositories.push(newSelected);
            }
            newSelected.isSelected = true;
            newSelected.lastOpenedAt = new Date().toISOString();
            updatedList.push({...newSelected});

            state.recentRepositories.sort((x1,x2) => {                
                if((x1.lastOpenedAt ?? "") > (x2.lastOpenedAt ?? "")) return -1;
                return 1;
            });
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
        },
        updateAutoStaging(state,action:PayloadAction<boolean>){
            state.autoStagingEnabled = action.payload;
        }

    }
});

export const ActionSavedData = SavedDataSlice.actions;
export const ReducerSavedData = SavedDataSlice.reducer;