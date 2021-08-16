import { RendererEvents, RepositoryInfo ,CreateRepositoryDetails} from "common_library";
import { ipcMain, ipcRenderer } from "electron";
import { existsSync, readdirSync } from "fs-extra";
import simpleGit, { SimpleGit, SimpleGitOptions } from "simple-git";
import { LogFields } from "../dataClasses";
import { CommitParser } from "./CommitParser";

export class GitManager{
    start(){
        this.addEventHandlers();
    }

    private addEventHandlers(){
        this.addValidGitPathHandler();
        this.addRepoDetailsHandler();
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

    private addRepoDetailsHandler(){
        ipcMain.on(RendererEvents.getRepositoryDetails().channel, async (e,repoInfo:RepositoryInfo)=>{
            const repoDetails = await this.getBranchDetails(repoInfo);
            e.reply(RendererEvents.getRepositoryDetails().replyChannel,repoDetails);
        });
    }

    private async getBranchDetails(repoInfo:RepositoryInfo){
        const repoDetails = CreateRepositoryDetails();
        const git = this.getGitRunner(repoInfo);
        const commits = await this.getCommits(git);
        repoDetails.allCommits = commits;
        
        return repoDetails;
    }

    private async getCommits(git: SimpleGit){
        const commitLimit=500;
        const LogFormat = "--pretty="+LogFields.Hash+":%H%n"+LogFields.Abbrev_Hash+":%h%n"+LogFields.Parent_Hashes+":%p%n"+LogFields.Author_Name+":%an%n"+LogFields.Author_Email+":%ae%n"+LogFields.Date+":%ad%n"+LogFields.Ref+":%D%n"+LogFields.Message+":%s%n";
        const logCallBack=(_e:any,data:string)=>{
            const commits = CommitParser.parse(data);                        
            // this.sendRepoInfoToRenderer();
        }
        try{
            let res = await git.raw(["log","--exclude=refs/stash", "--all",`--max-count=${commitLimit}`,`--skip=${0*commitLimit}`,"--date=iso-strict", LogFormat]);
            const commits = CommitParser.parse(res);
            return commits;
        }catch(e){
            console.error("error on get logs:", e);
        }
        // return new Promise<number>((resolve,reject)=>{
        //     resolve(7);
        //     let res = await git.raw(["log","--exclude=refs/stash", "--all",`--max-count=${commitLimit}`,`--skip=${0*commitLimit}`,"--date=iso-strict", LogFormat]);

        // })
       
    
    }


    private getGitRunner(repoInfo:RepositoryInfo){
        const options: Partial<SimpleGitOptions> = {
            baseDir: repoInfo.path,
            binary: 'git',
            maxConcurrentProcesses: 6,
         };
        let git = simpleGit(options);  
        return git;
    }
}