import {RendererEvents } from "common_library";
import { dialog, ipcMain, shell } from "electron";
import * as fs from 'fs';
import path = require("path");
import * as languageEncoding from "detect-file-encoding-and-language";


export class FileManager{
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

    getFileEncoding(path:string):Promise<string>{
        const langEnc = languageEncoding as any;
        return langEnc(path).then((fileInfo:any) => {
            return fileInfo.encoding;
        }).catch((_:any)=> {
            return "";
        });
    }

    async writeToFile(path:string,data:string){
        let encoding = "utf8" as any;
        return new Promise<boolean>((res)=>{
            fs.writeFile(path,data,{encoding},(err)=>{
                if(!err){
                    res(true);
                }
                else{
                    res(false);
                }
            });
        })
        
    }

    createPathIfNotExist(path:string){
        if (!fs.existsSync(path)){
            fs.mkdirSync(path, { recursive: true });
        }
    }
}