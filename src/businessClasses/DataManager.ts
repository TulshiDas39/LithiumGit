import { RendererEvents } from "common_library";
import { ipcMain } from "electron";
import { SavedData } from "../dataClasses";

export class DataManager{
    start(){
        this.handleRecentRepositoriesRequest();
    }

    private handleRecentRepositoriesRequest(){
        ipcMain.on(RendererEvents.getRecentRepositoires, (event, arg) => {            
            event.returnValue = SavedData.recentRepositories;
        });
    }
}