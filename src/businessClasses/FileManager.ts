import {EnumLinefeed, IChange, IFileProps, RendererEvents, StringUtils } from "common_library";
import { dialog, ipcMain, shell } from "electron";
import * as fs from 'fs';
import path = require("path");
import { isText, isBinary } from 'istextorbinary'
import { AppData } from "../dataClasses";
import * as iconv from 'iconv-lite';




export class FileManager{
    start(){
        this.addIpcHandlers();
    }

    addIpcHandlers(){
        this.handleGetDirectoryPath();
        this.handleGetFilePathUsingSaveAsDialog();
        this.handleOpenFileExplorer();
        this.handleGetFileContent();
        this.hangleGetFileContentRaw();
        this.handlePathJoin();
        this.handlePathJoinAsync();
        this.handleLastUpdatedDate();
        this.handleWriteToFile();
        this.handleIsBinary();
        this.handleGetFileProps();
        this.handleCopyFile();
        this.handleFileTracking();
        this.handleReWriteFile();
    }

    getEncodingList() {
        const encList = [
            "ascii",
            "big5",
            "euc-jp",
            "euc-kr",
            "gb18030",
            "gb2312",
            "gbk",
            "iso-2022-jp",
            "iso-8859-1",
            "iso-8859-15",
            "iso-8859-2",
            "iso-8859-5",
            "iso-8859-6",
            "iso-8859-7",
            "iso-8859-8",
            "iso-8859-9",
            "koi8-r",
            "koi8-u",
            "latin1",
            "shift_jis",
            "utf-16be",
            "utf-16le",
            "utf-8",
            "windows-1250",
            "windows-1251",
            "windows-1252",
            "windows-1253",
            "windows-1254",
            "windows-1255",
            "windows-1256",
            "windows-1257",
            "windows-1258",
        ];
        return encList;
    }

    private handleReWriteFile() {
        ipcMain.handle(RendererEvents.reWriteFile,async (e,filePath:string,lineFeedType:EnumLinefeed,encoding:string)=>{
            return await this.reWriteFile(filePath,lineFeedType,encoding);
        });
    }
    
    private handleFileTracking() {
        ipcMain.handle(RendererEvents.trackFileChanges,async (e,tempFilePath:string,untrackedChanges:IChange[],encoding:string)=>{
            let succeededCount = 0;
            for(let change of untrackedChanges){
                try{
                    await this.saveFileChanges(tempFilePath,change,encoding);
                    succeededCount++;
                }catch(err){
                    console.error("Error saving file changes:", err);
                    return succeededCount;
                }
            }
            return succeededCount;
        });
    }
    
    
    private handleCopyFile(){
        ipcMain.handle(RendererEvents.copyFile,async (e,fromFilePath:string,toFilePath:string)=>{
            return await this.copyFile(fromFilePath,toFilePath);
        });
    }

    copyFile(fromFilePath: string, toFilePath: string) {
        return fs.promises.copyFile(fromFilePath, toFilePath);        
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

    private hangleGetFileContentRaw() {
        ipcMain.handle(RendererEvents.getFileContentRaw,async (e,path:string)=>{
            const content = await this.getFileContentRaw(path);
            return content;
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

    getFileContentRaw(path: string) {
        return new Promise<string>((resolve,reject)=>{
            fs.readFile(path,{encoding:"utf8"},(err,data)=>{
                if(!err){                    
                    resolve(data);
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

    exists(path:string){
        return fs.existsSync(path);
    }

    async deleteFolder(path:string){
        await fs.promises.rm(path, { recursive: true, force: true });
    }

    createPathAsync(path:string){
        return fs.promises.mkdir(path, { recursive: true });
    }

    createPathIfNotExist(path:string){
        if (!fs.existsSync(path)){
            fs.mkdirSync(path, { recursive: true });
        }
    }

    private async reWriteFileWithPipe(sourceFilePath: string, lineFeedType: EnumLinefeed, encoding: string) {
        // Reading
        const readStream = fs.createReadStream(sourceFilePath);       // no encoding option
        const decoder = iconv.decodeStream(encoding);                 // iconv decode stream
        readStream.pipe(decoder); 

        const fileExtension = StringUtils.GetFileExtension(sourceFilePath);
        const tempFileName = `temp_${StringUtils.uuidv4()}${fileExtension}`;
        const tmpPath = path.join(AppData.tempPath, tempFileName);
        // Writing
        const writeStream = fs.createWriteStream(tmpPath);            // no encoding option
        const encoder = iconv.encodeStream(encoding);                 // iconv encode stream
        encoder.pipe(writeStream);                                    // encoder accepts strings, outputs bytes

        let buffer = '';

        try{
            for await (const chunk of readStream) {
                buffer += chunk;
                const parts = buffer.split(/(\r\n|\r|\n)/);
                buffer = parts.pop()!;                
                for (let i = 0; i < parts.length; i += 2) {
                    const line = parts[i];
                    encoder.write(line + lineFeedType);
                }                
            }
            encoder.write(buffer);
            await new Promise<void>((res, rej) => encoder.end(() => res()));

            await fs.promises.rename(tmpPath, sourceFilePath).catch(async (err) => {
                if (err.code === 'EXDEV') {
                    await fs.promises.copyFile(tmpPath, sourceFilePath);
                    await fs.promises.unlink(tmpPath);
                } else {
                    throw err;
                }
            });
        }catch(err){
            console.error("Error setting line feed:", err);
            writeStream.destroy();
            fs.promises.unlink(tmpPath).catch(() => { /* ignore */ });
            throw err;
        }
    }

    async reWriteFile(sourceFilePath: string, lineFeedType: EnumLinefeed,encoding:string) {
        const supportEncoding = Buffer.isEncoding(encoding);
        const readStream = fs.createReadStream(sourceFilePath, { encoding: supportEncoding? encoding:undefined as any });
        const fileExtension = StringUtils.GetFileExtension(sourceFilePath);
        const tempFileName = `temp_${StringUtils.uuidv4()}${fileExtension}`;
        const tmpPath = path.join(AppData.tempPath, tempFileName);
        const writeStream = fs.createWriteStream(tmpPath, { encoding: supportEncoding? encoding:undefined as any });

        let pipe:NodeJS.ReadWriteStream|undefined = undefined;
        if(!supportEncoding){
            pipe = iconv.encodeStream(encoding);
            pipe.pipe(writeStream);
        }
        let buffer = '';


        const writer = pipe || writeStream;

        try{
            for await (const chunk of readStream) {
                buffer += chunk;
                const parts = buffer.split(/(\r\n|\r|\n)/);
                buffer = parts.pop()!;                
                for (let i = 0; i < parts.length; i += 2) {
                    const line = parts[i];
                    writer.write(line + lineFeedType);
                }                
            }
            writer.write(buffer);
            await new Promise<void>((res, rej) => writer.end(((err :any) => err ? rej(err) : res()) as any) );

            await fs.promises.rename(tmpPath, sourceFilePath).catch(async (err) => {
                if (err.code === 'EXDEV') {
                    await fs.promises.copyFile(tmpPath, sourceFilePath);
                    await fs.promises.unlink(tmpPath);
                } else {
                    throw err;
                }
            });
        }catch(err){
            console.error("Error setting line feed:", err);
            writeStream.destroy();
            fs.promises.unlink(tmpPath).catch(() => { /* ignore */ });
            throw err;
        }

    }

    async saveFileChanges(sourceFilePath: string, change: IChange,encoding:string) {
        
        const readStream = fs.createReadStream(sourceFilePath, { encoding: encoding as any });
        const fileExtension = StringUtils.GetFileExtension(sourceFilePath);
        const tempFileName = `temp_${StringUtils.uuidv4()}${fileExtension}`;
        const tmpPath = path.join(AppData.tempPath, tempFileName);
        const writeStream = fs.createWriteStream(tmpPath, { encoding: encoding as any });

        let currLineIndex = -1;
        let inserted = false;
        let buffer = '';

        const update=(parts:string[])=>{
            for (let i = 0; i < parts.length; i += 2) {
                const line = parts[i];
                const ending = parts[i + 1] ?? '';

                currLineIndex++;
                if (!inserted && currLineIndex >= change.startlineIndex) {                    
                    let segment = '';
                    if(change.startlineIndex === currLineIndex){
                        segment = line.substring(0, change.startOffset);
                        writeStream.write(segment);
                        writeStream.write(change.text);
                    }
                    if(change.endlineIndex === currLineIndex){
                        segment = line.substring(change.endOffset);
                        writeStream.write(segment + ending);
                        inserted = true;
                    }                        
                    continue;                                        
                }
                writeStream.write(line + ending);
            }
        }
        try{

            for await (const chunk of readStream) {
                buffer += chunk;
                const parts = buffer.split(/(\r\n|\r|\n)/);
                buffer = parts.pop()!;
                update(parts);            
            }

            const lParts = buffer.split(/(\r\n|\r|\n)/);
            update(lParts);
            

            await new Promise<void>((res, rej) => writeStream.end((err:any) => err ? rej(err) : res()));
            await fs.promises.rename(tmpPath, sourceFilePath).catch(async (err) => {
                if (err.code === 'EXDEV') {
                    await fs.promises.copyFile(tmpPath, sourceFilePath);
                    await fs.promises.unlink(tmpPath);
                } else {
                    throw err;
                }
            });
        }catch(err){
            console.error("Error saving file changes:", err);
            writeStream.destroy();
            fs.promises.unlink(tmpPath).catch(() => { /* ignore */ });
            throw err;
        }
    }
}