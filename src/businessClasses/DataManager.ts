import { Annotation, IConfigInfo, RendererEvents, RepositoryInfo } from "common_library";
import { ipcMain } from "electron";
import { SavedData } from "../dataClasses";
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
        this.handleSavedDataRequest();
        this.handleAnnotationsRequest();
        this.handleAnnotationAdd();
        this.handleConfigUpdate();

    }

    private handleConfigUpdate(){
        ipcMain.handle(RendererEvents.updateConfig, async(_, config:IConfigInfo) => {            
            await DB.config.updateOneAsync(config);
            SavedData.data.configInfo = config;
        });
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

    private handleAnnotationsRequest(){
        ipcMain.handle(RendererEvents.annotations, async(e,repoId:string) => {            
            const r = await DB.annotation.findAsync({repoId});
            return r;
        });
    }

    private handleAnnotationAdd(){
        ipcMain.handle(RendererEvents.addAnnotation, async(_e,annots:Annotation[]) => {            
            await DB.annotation.insertManyAsync(annots);
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

}