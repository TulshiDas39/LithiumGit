import { RendererEvents } from "common_library";
import { ipcMain } from "electron";
import { existsSync, readdirSync } from "fs-extra";

export class GitManager{
    start(){
        this.addEventHandlers();
    }

    private addEventHandlers(){
        this.addValidGitPathHandler();
    }

    private addValidGitPathHandler(){
        ipcMain.on(RendererEvents.isValidRepoPath,(e,path:string)=>{
            if(!existsSync(path)) {
                e.returnValue = false;
                return;
            }
            const subDirNames = readdirSync(path, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
            console.log(subDirNames);
            
            if(subDirNames.every(name=> name !== ".git")) e.returnValue = false;
            else e.returnValue = true;
        })
    }
}