import { EnumConflictSide, IActionTaken, RendererEvents } from "common_library";
import { dialog, ipcMain, shell } from "electron";
import * as fs from 'fs';
import path = require("path");

export class FileManager{
    resolveConflict(path: string, actions: IActionTaken[]) {
        fs.readFile(path,{encoding:"utf8"},(err,data)=>{
            if(!err){
                const lines = data.split(/\n/g);
                const currentMarker = "<<<<<<< HEAD";
                const endingMarker = ">>>>>>>";
                const separator = "=======";
                let actionIndex = 0;
                for(let i=0;i<lines.length;i++){
                    let line = lines[i];
                    if(line.startsWith(currentMarker)){
                        const action = actions[actionIndex];
                        lines.splice(i,1);
                        line = lines[i];
                        const currentChanges:string[] = [];
                        const incomingChanges:string[] = [];
                    
                        while(line !== separator){
                            lines.splice(i,1);
                            currentChanges.push(line);
                            line = lines[i];
                        }
                        lines.splice(i,1);

                        while(!line.startsWith(endingMarker)){
                            lines.splice(i,1);
                            incomingChanges.push(line);
                            line = lines[i];
                        }
                        lines.splice(i,1);
                        for(let item of action.taken){
                            if(item ===  EnumConflictSide.Current){
                                currentChanges.forEach(l => {
                                    lines.splice(i,0,l);
                                    i++;
                                });
                            }
                            else{
                                incomingChanges.forEach(l=> {
                                    lines.splice(i,0,l);
                                    i++;
                                });
                            }
                        }
                    }
                    i--;
                }
            }
        })
    }
    start(){
        this.addIpcHandlers();
    }

    addIpcHandlers(){
        this.handleGetDirectoryPath();
        this.handleOpenFileExplorer();
        this.handleGetFileContent();
        this.handlePathJoin();
    }
    handleGetFileContent() {
        ipcMain.handle(RendererEvents.getFileContent().channel,async (e,path:string)=>{
            const lines = await this.getFileContent(path);
            return lines;
        });
    }

    handlePathJoin(){
        ipcMain.on(RendererEvents.joinPath().channel,(e,...pathSegments:string[])=>{
            const joinedPath = path.join(...pathSegments);
            e.returnValue = joinedPath;
        });
    }
    
    getFileContent(path: string) {
        return new Promise<string[]>((resolve,reject)=>{
            fs.readFile(path,{encoding:"utf8"},(err,data)=>{
                if(!err){
                    const lines = data.split(/\r\n|\r|\n/g);
                    resolve(lines);
                }
                else if(err) reject(err);
            })
        })
    }

    handleGetDirectoryPath(){
        ipcMain.handle(RendererEvents.getDirectoryPath().channel,(e)=>{
            return this.getDirectoryPathUsingExplorer();
        });        
    }

    private getDirectoryPathUsingExplorer(){
        return dialog.showOpenDialog({
                properties: ['openDirectory']
            }).then(res=>{
                return res.filePaths[0];
            });
    }

    private handleOpenFileExplorer(){
        ipcMain.handle(RendererEvents.openFileExplorer,(e,path:string)=>{
            shell.showItemInFolder(path);
        })
    }
}