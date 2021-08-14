import { RendererEvents, RepositoryInfo } from "common_library";
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
    }

    private handleRecentRepositoriesRequest(){
        ipcMain.on(RendererEvents.getRecentRepositoires, (event, arg) => {            
            event.returnValue = SavedData.recentRepositories;
        });
    }

    private handleUpdateRepositories(){
        ipcMain.on(RendererEvents.updateRepositories,(_,data:RepositoryInfo[])=>{
            DB.repository.updateMany(data);
        });
    }
}