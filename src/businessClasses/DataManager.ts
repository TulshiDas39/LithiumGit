import { RendererEvents, RepositoryInfo } from "common_library";
import { ipcMain } from "electron";
import { AppData, SavedData } from "../dataClasses";
import { DB } from "../db_service";

export class DataManager{
    start(){
        this.addIpcHandlers();
    }

    private addIpcHandlers(){
        this.handleRecentRepositoriesRequest();
        this.handleUpdateRepositories();
        this.handleUpdateRepository();
        this.handleRemoveRepository();
        this.handleUpdateAutoStaging();
        this.handleSavedDataRequest();

    }

    private handleSavedDataRequest(){
        ipcMain.on(RendererEvents.getSaveData().channel, (event, arg) => {            
            event.returnValue = SavedData.data;
        });
    }

    private handleRecentRepositoriesRequest(){
        ipcMain.handle(RendererEvents.getRecentRepositoires, async() => {            
            return await DB.repository.getAll();            
        });
    }

    private handleUpdateRepositories(){
        ipcMain.on(RendererEvents.updateRepositories,(_,data:RepositoryInfo[])=>{            
            DB.repository.updateOrCreateMany(data);
            for(let repo of data){
                var index = SavedData.data.recentRepositories.findIndex(_=>_.path == repo.path);
                if(index > -1){
                    SavedData.data.recentRepositories[index] = repo;
                }
                else{
                    SavedData.data.recentRepositories.push(repo);
                }
            }
        });
    }
    private handleUpdateRepository(){
        ipcMain.handle(RendererEvents.updateRepository,(_,repo:RepositoryInfo)=>{            
            DB.repository.updateOne(repo);
            var index = SavedData.data.recentRepositories.findIndex(_=>_.path == repo.path);
            if(index > -1){
                SavedData.data.recentRepositories[index] = repo;
            }
            else{
                SavedData.data.recentRepositories.push(repo);
            }
        });
    }

    private handleRemoveRepository(){
        ipcMain.handle(RendererEvents.removeRecentRepo, async(_, repoId:string)=>{
            await DB.repository.deleteAsync({_id:repoId});
            SavedData.data.recentRepositories = SavedData.data.recentRepositories.filter(_ => _._id !== repoId);
        });
    }

    private handleUpdateAutoStaging(){
        ipcMain.on(RendererEvents.updateAutoStaging().channel,(e,value:boolean)=>{            
            SavedData.data.configInfo.autoStage = value;
            DB.config.updateOne(SavedData.data.configInfo,(err,count)=>{
                e.returnValue = true;
            });
        });
    }
}