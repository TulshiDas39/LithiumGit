import { RendererEvents } from "common_library";
import { dialog, ipcMain, shell } from "electron";

export class FileManager{
    start(){
        this.addIpcHandlers();
    }

    addIpcHandlers(){
        this.handleGetDirectoryPath();
        this.handleOpenFileExplorer();
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

    private handleOpenFileExplorer(){
        ipcMain.on(RendererEvents.openFileExplorer,(e,path:string)=>{
            shell.showItemInFolder(path);
        })
    }
}