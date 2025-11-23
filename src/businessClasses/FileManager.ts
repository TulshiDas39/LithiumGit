import {IFileProps, RendererEvents } from "common_library";
import { dialog, ipcMain, shell } from "electron";
import * as fs from 'fs';
import path = require("path");
import { isText, isBinary } from 'istextorbinary'



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
        this.handleWriteToFile();
        this.handleIsBinary();
        this.handleGetFileProps();
    }

    private handleGetFileProps(){
        ipcMain.handle(RendererEvents.getFileProps,async (e,pathStr:string)=>{
            return await this.getFileProps(pathStr);
        });
    }
    handleGetFileContent() {
        ipcMain.handle(RendererEvents.getFileContent().channel,async (e,path:string)=>{
            const lines = await this.getFileContent(path);
            return lines;
        });
    }

    handleIsBinary() {
        ipcMain.handle(RendererEvents.isBinary,async (e,path:string)=>{
            return await this.isBinary(path);            
        });
    }

    private async isBinary(pathStr:string,checkContent=false){
        const fileName = path.basename(pathStr);
        if(fileName.includes('.')){
            return isBinary(fileName);
        }
        else if(checkContent){
            try{
                const dataChunk = await this.readFirstChars(pathStr,1000);
                const isTextFile = isText(null,Buffer.from(dataChunk));
                return !isTextFile;
            }catch{
                return true;
            }
        }

        return false;
        
    }

    private getFileProps(path:string){
        return fs.promises.stat(path).then(stats=>{
                const sizeKB = Number((stats.size / 1024).toFixed(2));
                return {
                    sizeKB,
                    path,
                } as IFileProps;
        });
    }

    readFirstChars(filePath: string, length: number) {
        return new Promise<string>((resolve, reject) => {
            const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
            let result = '';
            stream.on('data', chunk => {
                result += chunk;
                if (result.length >= length) {
                    stream.destroy();
                    resolve(result.slice(0, length));
                }
            });
            stream.on('end', () => {
                resolve(result.slice(0, length));
            });
            stream.on('error', err => {
                reject(err);
            });
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
        ipcMain.handle(RendererEvents.getDirectoryPath().channel,(e,options:Electron.OpenDialogOptions['properties'],filters:Electron.OpenDialogOptions['filters'])=>{
            return this.getDirectoryPathUsingExplorer(options,filters);
        });
    }

    handleGetFilePathUsingSaveAsDialog(){
        ipcMain.handle(RendererEvents.showSaveAsDialog,(e,options:Electron.SaveDialogOptions['filters'])=>{
            return this.getFilePathUsingSaveAsDialog(options);
        });        
    }
    
    private handleWriteToFile(){
        ipcMain.handle(RendererEvents.writeToFile,(e,path:string, content:string)=>{
            return this.writeToFile(path,content);
        });        
    }

    private getDirectoryPathUsingExplorer(options:Electron.OpenDialogOptions['properties'],
        filters:Electron.OpenDialogOptions['filters'])
    {
        return dialog.showOpenDialog({
                filters: filters,           
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

    getFileEncoding(path:string){
        // const langEnc = languageEncoding as any;
        // return langEnc(path).then((fileInfo:any) => {
        //     return fileInfo.encoding;
        // }).catch((_:any)=> {
        //     return "";
        // });
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