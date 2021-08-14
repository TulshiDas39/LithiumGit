import { RendererEvents } from "common_library";
import { dialog, ipcMain } from "electron";

export class FileManager{
    start(){
        this.addIpcHandlers();
    }

    addIpcHandlers(){
        this.handleGetDirectoryPath();
    }

    handleGetDirectoryPath(){
        ipcMain.on(RendererEvents.getDirectoryPath().channel,(e)=>{
            dialog.showOpenDialog({
                properties: ['openDirectory']
            }).then(res=>{
                res.filePaths[0];
                e.reply(RendererEvents.getDirectoryPath().replyChannel,res.filePaths[0]);
            });

        });
        
    }
}