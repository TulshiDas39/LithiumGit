import { Annotation, EnumNotificationType, IAppInfo, IConfigInfo, INotification, RendererEvents, RepositoryInfo } from "common_library";
import { app, ipcMain } from "electron";
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
        this.handleSavedDataRequest();
        this.handleAnnotationsRequest();
        this.handleAnnotationAdd();
        this.handleAnnotationDelete();
        this.handleConfigUpdate();
        this.handleNotificationsFetch();
        this.handleNotificationsClear();
        this.handleRemoveNotifications();
        this.handleUpdateNotifications();
        this.handleAppInfoRequest();
        this.setCheckForUpdateTime();
    }

    private handleConfigUpdate(){
        ipcMain.handle(RendererEvents.updateConfig, async(_, config:IConfigInfo) => {            
            await DB.config.updateOneAsync(config);
            SavedData.data.configInfo = config;
        });
    }

    private setCheckForUpdateTime(){
        ipcMain.handle(RendererEvents.setCheckForUpdateTime, async(_, time:string) => {            
            SavedData.data.configInfo.checkedForUpdateAt = time;
            await DB.config.updateOneAsync(SavedData.data.configInfo);
        });
    }

    private handleSavedDataRequest(){
        ipcMain.on(RendererEvents.getSaveData().channel, (event, arg) => {            
            event.returnValue = SavedData.data;
        });
    }

    private handleAppInfoRequest(){
        ipcMain.on(RendererEvents.getAppInfo, (event, arg) => {
            const info:IAppInfo = {
                version:app.getVersion()
            };
            console.log("app version",info.version);
            event.returnValue = info;
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

    private handleNotificationsFetch(){
        ipcMain.handle(RendererEvents.loadNotifications, async(_e) => {            
            return await DB.notification.getAll();
        });
    }

    private handleNotificationsClear(){
        ipcMain.handle(RendererEvents.clearNotifications, async(_e) => {            
            return await DB.notification.deleteAsync({},true);
        });
    }

    private handleRemoveNotifications(){
        ipcMain.handle(RendererEvents.deleteNotifcations, async(_e,items:INotification[]) => {
            for(let item of items){
                await DB.notification.deleteAsync({_id:item._id});
            }
        });
    }

    private handleUpdateNotifications(){
        ipcMain.handle(RendererEvents.updateNotifications, async(_e,items:INotification[]) => {
            for(let item of items){
                await DB.notification.updateOneAsync(item);
            }
        });
    }

    //markAllNotificationAsRead

    private handleAnnotationDelete(){
        ipcMain.handle(RendererEvents.removeAnnotation, async(_e,annots:Annotation[]) => {            
            for(let annot of annots){
                await DB.annotation.deleteAsync(annot);
            }
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