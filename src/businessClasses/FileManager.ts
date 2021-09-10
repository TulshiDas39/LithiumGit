import { RendererEvents } from "common_library";
import { dialog, ipcMain, shell } from "electron";
import * as fs from 'fs';

export class FileManager{
    start(){
        this.addIpcHandlers();
    }

    addIpcHandlers(){
        this.handleGetDirectoryPath();
        this.handleOpenFileExplorer();
        this.handleGetFileContent();
    }
    handleGetFileContent() {
        ipcMain.on(RendererEvents.getFileContent().channel,async (e,path:string)=>{
            const lines = await this.getFileContent(path);
            e.reply(RendererEvents.getFileContent().replyChannel,lines);
        });
    }
    
    getFileContent(path: string) {
        return new Promise<string[]>((resolve,reject)=>{
            fs.readFile(path,{encoding:"utf8"},(err,data)=>{
                if(data){
                    const lines = data.split('\n');
                    resolve(lines);
                }
                else if(err) reject(err);
            })
        })
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