import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EnumTheme, IAppInfo, IConfigInfo, RendererEvents, RepositoryInfo } from "common_library";
import { IpcUtils } from "../../lib/utils/IpcUtils";
import { CacheUtils, RepoUtils } from "../../lib";

interface ISavedData{
    recentRepositories:RepositoryInfo[];
    autoStagingEnabled:boolean;
    configInfo:IConfigInfo;
    appInfo:IAppInfo;
}

const initialState:ISavedData={
    recentRepositories:[],
    autoStagingEnabled:false,
    configInfo:{
        _id:"",
        createdAt: new Date().toISOString(),
        theme:EnumTheme.Dark,
        updateAt:new Date().toISOString(),
        checkedForUpdateAt: new Date().toISOString(),
    },
    appInfo:null!,
}

const SavedDataSlice = createSlice({
    initialState:initialState,
    name:"SavedData",
    reducers:{
        setRecentRepositories(state,action:PayloadAction<RepositoryInfo[]>){
            state.recentRepositories = action.payload;
        },
        removeRepositoryFromRecentList(state,action:PayloadAction<RepositoryInfo>){
            IpcUtils.removeRecentRepo(action.payload._id);
            state.recentRepositories = state.recentRepositories.filter(_=> _._id !== action.payload._id);
        },
        setSelectedRepository(state,action:PayloadAction<RepositoryInfo>){
            RepoUtils.selectedRepo = action.payload;
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
        updateRepository(state,action:PayloadAction<RepositoryInfo>){
            const index = state.recentRepositories.findIndex(_=> _.path === action.payload.path);
            state.recentRepositories[index] = action.payload;
            IpcUtils.updateRepository(action.payload);
        },

        updateConfig(state,action:PayloadAction<IConfigInfo>){
            state.configInfo = action.payload;
            IpcUtils.updateConfig(action.payload);
        },
        setCheckForUpdateTime(state,action:PayloadAction<string>){
            state.configInfo.checkedForUpdateAt = action.payload;
            IpcUtils.setCheckForUpdateTime(action.payload);
        },
        toogleTheme(state){
            if(state.configInfo.theme === EnumTheme.Light){
                state.configInfo.theme = EnumTheme.Dark;
            }else{
                state.configInfo.theme = EnumTheme.Light;
            }
            IpcUtils.updateConfig({...state.configInfo});
        },
        setActiveOrigin(state,action:PayloadAction<string>){
            const repo = state.recentRepositories.find(_=>_.isSelected);
            repo!.activeOrigin = action.payload;            
            RepoUtils.repositoryDetails.repoInfo.activeOrigin = action.payload;
            IpcUtils.updateRepository(RepoUtils.repositoryDetails.repoInfo);
            CacheUtils.setRepoDetails(RepoUtils.repositoryDetails);
        },
        setAppInfo(state,action:PayloadAction<IAppInfo>){
            state.appInfo = action.payload;
        }

    }
});

export const ActionSavedData = SavedDataSlice.actions;
export const ReducerSavedData = SavedDataSlice.reducer;