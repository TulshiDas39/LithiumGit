import { RendererEvents, RepositoryInfo ,CreateRepositoryDetails, IRemoteInfo,IStatus, ICommitInfo} from "common_library";
import { ipcMain, ipcRenderer } from "electron";
import { existsSync, readdirSync } from "fs-extra";
import simpleGit, { SimpleGit, SimpleGitOptions } from "simple-git";
import { AppData, LogFields } from "../dataClasses";
import { CommitParser } from "./CommitParser";
import * as path from 'path';

export class GitManager{
    start(){
        this.addEventHandlers();
    }

    private addEventHandlers(){
        this.addValidGitPathHandler();
        this.addRepoDetailsHandler();
        this.addStatusHandler();
        this.addStageItemHandler();
        this.addUnStageItemHandler();
        this.addDiscardUnStagedItemHandler();
        this.addDiffHandler();
        this.addCheckOutCommitHandlder();
    }

    addCheckOutCommitHandlder(){
        // RendererEvents.checkoutCommit
        ipcMain.on(RendererEvents.checkoutCommit().channel,async (e,commit:ICommitInfo,repository:RepositoryInfo)=>{
            await this.checkoutCommit(commit,repository,e);
            e.reply(RendererEvents.checkoutCommit().replyChannel,commit);
        })
    }

    addDiffHandler() {
        ipcMain.on(RendererEvents.diff().channel, async(e,options:string[],repoInfo:RepositoryInfo)=>{
            const res = await this.getDiff(options,repoInfo);
            e.reply(RendererEvents.diff().replyChannel, res);
        })
    }
    async getDiff(options: string[], repoInfo: RepositoryInfo) {
        const git = this.getGitRunner(repoInfo);        
        const result = await git.diff(options);
        AppData.mainWindow.webContents.send(RendererEvents.logger,result);
        return result;
    }

    private addDiscardUnStagedItemHandler() {
        ipcMain.on(RendererEvents.discardItem().channel, async(e,paths:string[],repoInfo:RepositoryInfo)=>{
            const res = await this.discardUnStageItem(paths,repoInfo);
            e.reply(RendererEvents.discardItem().replyChannel, res);
        })
    }
    private addUnStageItemHandler() {
        ipcMain.on(RendererEvents.unStageItem().channel, async(e,paths:string[],repoInfo:RepositoryInfo)=>{
            const res = await this.unStageItem(paths,repoInfo);
            e.reply(RendererEvents.unStageItem().replyChannel, res);
        })
    }
    private addStageItemHandler() {
        ipcMain.on(RendererEvents.stageItem().channel, async(e,paths:string[],repoInfo:RepositoryInfo)=>{
            const res = await this.stageItem(paths,repoInfo);
            e.reply(RendererEvents.stageItem().replyChannel, res);
        })
    }

    private async discardUnStageItem(paths:string[],repoInfo:RepositoryInfo){
        const git = this.getGitRunner(repoInfo);
        await git.checkout(['--',...paths]);
        const updatedStatus = await this.getStatus(repoInfo);
        return updatedStatus;
    }

    private async unStageItem(paths:string[],repoInfo:RepositoryInfo){
        const git = this.getGitRunner(repoInfo);
        await git.reset(paths);
        const updatedStatus = await this.getStatus(repoInfo);
        return updatedStatus;
    }

    private async stageItem(path:string[],repoInfo:RepositoryInfo){
        const git = this.getGitRunner(repoInfo);
        await git.add(path);
        const updatedStatus = await this.getStatus(repoInfo);
        return updatedStatus;
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
            const repoDetails = await this.repoDetails(repoInfo);
            e.reply(RendererEvents.getRepositoryDetails().replyChannel,repoDetails);
        });
    }

    private addStatusHandler(){
        ipcMain.on(RendererEvents.getStatus().channel, async (e,repoInfo:RepositoryInfo)=>{
            const repoDetails = await this.getStatus(repoInfo);
            e.reply(RendererEvents.getStatus().replyChannel,repoDetails);
        });
    }

    private async repoDetails(repoInfo:RepositoryInfo){
        const repoDetails = CreateRepositoryDetails();
        repoDetails.repoInfo = repoInfo;
        const git = this.getGitRunner(repoInfo);
        const commits = await this.getCommits(git);
        repoDetails.allCommits = commits;
        
        const remotes = await git.getRemotes(true);
        remotes.forEach(r=>{
            const remote:IRemoteInfo = {
                name:r.name,
                url:r.refs.fetch || r.refs.push,
                actionTyps:[]
            };
            if(!!r.refs.fetch) remote.actionTyps.push("fetch");
            if(!!r.refs.push) remote.actionTyps.push("push");
            repoDetails.remotes.push(remote);
        });
        
        return repoDetails;
    }

    private async getStatus(repoInfo:RepositoryInfo){
        const git = this.getGitRunner(repoInfo);
        const status = await git.status();
        const result = {} as IStatus;
        
        result.ahead = status.ahead;
        result.behind = status.behind;
        result.modified = status.modified?.map(x=> ({fileName:path.basename(x),path:x}));
        result.staged = status.staged?.map(x=> ({fileName:path.basename(x),path:x}));
        result.isClean = status?.isClean();
        result.not_added = status.files?.filter(x=>x.working_dir === "M")?.map(x=> ({fileName:path.basename(x.path),path:x.path}));
        result.deleted = status.deleted?.map(x=> ({fileName:path.basename(x),path:x}));
        result.created = status.files?.filter(x=>x.working_dir === "?" && x.index === "?")?.map(x=> ({fileName:path.basename(x.path),path:x.path}));        
        
        return result;
    }

    private async getCommits(git: SimpleGit){
        const commitLimit=500;
        const LogFormat = "--pretty="+LogFields.Hash+":%H%n"+LogFields.Abbrev_Hash+":%h%n"+LogFields.Parent_Hashes+":%p%n"+LogFields.Author_Name+":%an%n"+LogFields.Author_Email+":%ae%n"+LogFields.Date+":%ad%n"+LogFields.Ref+":%D%n"+LogFields.Message+":%s%n";
        try{
            let res = await git.raw(["log","--exclude=refs/stash", "--all",`--max-count=${commitLimit}`,`--skip=${0*commitLimit}`,"--date=iso-strict", LogFormat]);
            const commits = CommitParser.parse(res);
            return commits;
        }catch(e){
            console.error("error on get logs:", e);
        }
    
    }

    private async checkoutCommit(commit:ICommitInfo,repoInfo:RepositoryInfo,e: Electron.IpcMainEvent){
        const git = this.getGitRunner(repoInfo);
        if(commit.nextCommit){
            await git.checkout(commit.hash);
            e.reply(RendererEvents.checkoutCommit().replyChannel,commit);
        }
        else{
            await git.checkout(commit.ownerBranch.name);
            AppData.mainWindow.webContents.send(RendererEvents.refreshBranchPanel().channel);
        }
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