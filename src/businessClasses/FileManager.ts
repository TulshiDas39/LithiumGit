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
        this.handleGetFilePathUsingSaveAsDialog();
        this.handleOpenFileExplorer();
        this.handleGetFileContent();
        this.handlePathJoin();
        this.handlePathJoinAsync();
        this.handleLastUpdatedDate();
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

    private handlePathJoinAsync(){
        ipcMain.handle(RendererEvents.joinPathAsync,(_e,...pathSegments:string[])=>{
            const joinedPath = path.join(...pathSegments);
            return joinedPath;
        });
    }

    private handleLastUpdatedDate(){
        ipcMain.handle(RendererEvents.lastUpdatedDate,(e,path:string)=>{
            return this.getLastUpdatedDate(path);
        });
    }

    getLastUpdatedDate(path:string){
        return new Promise<string>((res)=>{
            fs.stat(path,(err,r)=>{
                if(err){
                    res("");
                }else{
                    res(r.mtime?.toISOString() || "");
                }
            })
        })
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
        ipcMain.handle(RendererEvents.getDirectoryPath().channel,(e,options:Electron.OpenDialogOptions['properties'])=>{
            return this.getDirectoryPathUsingExplorer(options);
        });        
    }

    handleGetFilePathUsingSaveAsDialog(){
        ipcMain.handle(RendererEvents.showSaveAsDialog,(e,options:Electron.SaveDialogOptions['filters'])=>{
            return this.getFilePathUsingSaveAsDialog(options);
        });        
    }    

    private getDirectoryPathUsingExplorer(options:Electron.OpenDialogOptions['properties']){
        return dialog.showOpenDialog({
                properties: options
            }).then(res=>{
                return res.filePaths[0];
            });
    }

    private getFilePathUsingSaveAsDialog(options:Electron.SaveDialogOptions['filters']){
        return dialog.showSaveDialog({
                filters:options,
            }).then(res=>{
                return res.filePath;
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