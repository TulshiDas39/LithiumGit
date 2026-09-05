import { RendererEvents } from "common_library/lib";
import { ipcMain } from "electron";
import { AppData } from "../dataClasses";

export class AppManager{
    start(){
        this.addEventHandlers();
    }

    private addEventHandlers(){
        this.addAppDisplayHandler();
    }

    private addAppDisplayHandler(){
        ipcMain.handle(RendererEvents.displayApp, async (e)=>{
            return await new Promise((res)=>{
                AppData.mainWindow.hide();
                setTimeout(()=>{
                    AppData.mainWindow.maximize();
                    setTimeout(() => {
                        //AppData.mainWindow.show();
                        res(true);
                    }, 1500);                    
                },1000)
            })                        
        })
    }
}