import { RendererEvents, RepositoryInfo ,CreateRepositoryDetails, IRemoteInfo,IStatus, ICommitInfo, IRepositoryDetails} from "common_library";
import { ipcMain, ipcRenderer } from "electron";
import { existsSync, readdirSync } from "fs-extra";
import simpleGit, { FetchResult, PullResult, PushResult, SimpleGit, SimpleGitOptions } from "simple-git";
import { AppData, LogFields, SavedData } from "../dataClasses";
import { CommitParser } from "./CommitParser";
import * as path from 'path';

export class GitManager{
    private readonly LogFormat = "--pretty="+LogFields.Hash+":%H%n"+LogFields.Abbrev_Hash+":%h%n"+LogFields.Parent_Hashes+":%p%n"+LogFields.Author_Name+":%an%n"+LogFields.Author_Email+":%ae%n"+LogFields.Date+":%ad%n"+LogFields.Ref+":%D%n"+LogFields.Message+":%s%n";
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
        this.addCreateBranchHandler();
        this.addPullHandler();
        this.addPushHandler();
        this.addFetchHandler();
        this.addCommitHandler();
        this.addGitShowHandler();
        this.addMergeHandler();
    }


    addMergeHandler(){
        ipcMain.on(RendererEvents.gitMerge().channel, async (e,repository:RepositoryInfo,options:string[])=>{
            const result = await this.merge(repository,options);
            e.reply(RendererEvents.gitMerge().replyChannel,result);
        })
    }

    async merge(repoInfo:RepositoryInfo,options:string[]){
        try {
            const git = this.getGitRunner(repoInfo);
            await git.merge(options);
            const result = await this.getStatus(repoInfo);            
            return result;
        } catch (error) {
            const errStr = error?.toString();
            console.log("Error in merger:"+errStr);
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,errStr);
            return null;
        }
        
    }

    addGitShowHandler(){
        ipcMain.on(RendererEvents.gitShow().channel, async (e,repository:RepositoryInfo,options:string[])=>{
            const result = await this.getShowResult(repository,options);
            e.reply(RendererEvents.gitShow().replyChannel,result);
        })
    }

    async getShowResult(repository:RepositoryInfo,options:string[]){
        try {
            const git = this.getGitRunner(repository);
            const result = await git.show(options);   
            return result;
        } catch (error) {
            console.log("error in git show:"+error?.toString());
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,error?.toString());
        }        
    }

    addCommitHandler(){
        ipcMain.on(RendererEvents.commit().channel, async (e,repository:RepositoryInfo,message:string)=>{
            await this.giveCommit(e,repository,message);
            // e.reply(RendererEvents.createBranch().replyChannel,sourceCommit,newBranchName,status,checkout);
        })
    }

    async giveCommit(e: Electron.IpcMainEvent,repository:RepositoryInfo,message:string){
        try {
            const git = this.getGitRunner(repository);
            if(SavedData.data.configInfo.autoStage){
                await git.add(["."]);
            }
            await git.commit(message);
            const status = await this.getStatus(repository);
            e.reply(RendererEvents.commit().replyChannel,true);
            AppData.mainWindow?.webContents.send(RendererEvents.getStatus().replyChannel,status)
        } catch (error) {
            console.log("Error when commit:"+error?.toString());
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,error?.toString());
        }
        
    }

    addCreateBranchHandler(){
        ipcMain.on(RendererEvents.createBranch().channel, async (e,sourceCommit:ICommitInfo,repository:IRepositoryDetails,newBranchName,checkout:boolean)=>{
            const status = await this.createBranch(sourceCommit,repository,newBranchName,checkout);
            e.reply(RendererEvents.createBranch().replyChannel,sourceCommit,newBranchName,status,checkout);
        })
    }
    addCheckOutCommitHandlder(){
        // RendererEvents.checkoutCommit
        ipcMain.on(RendererEvents.checkoutCommit().channel,async (e,repoInfo:RepositoryInfo,options:string[])=>{
            await this.checkoutCommit(repoInfo,options,e);
            // e.reply(RendererEvents.checkoutCommit().replyChannel,commit);
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

    private setActiveOrigin(repoDetails:IRepositoryDetails){
        const defaultOrigin = repoDetails.repoInfo.activeOrigin;
        let origin = repoDetails.remotes.find(x => x.name === defaultOrigin);
        if(!origin) origin = repoDetails.remotes[0];
        repoDetails.repoInfo.activeOrigin = origin.name;
    }

    setHead(repoDetails:IRepositoryDetails){
        const status = repoDetails.status;
        const head = repoDetails.allCommits.find(x=>x.hash === status.headCommit.hash);
        if(!head) return;
        head.isHead = true;
        repoDetails.headCommit = head;        
    }

    private async repoDetails(repoInfo:RepositoryInfo){
        const repoDetails = CreateRepositoryDetails();
        repoDetails.repoInfo = repoInfo;
        const git = this.getGitRunner(repoInfo);
        const commits = await this.getCommits(git);
        repoDetails.allCommits = commits;
        repoDetails.branchList = await this.getAllBranches(git);
        repoDetails.status = await this.getStatus(repoInfo);
        this.setHead(repoDetails);
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

        this.setActiveOrigin(repoDetails);
        
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
        result.conflicted = status.conflicted?.map(x=> ({fileName:path.basename(x),path:x}));
        result.isClean = status?.isClean();
        result.not_added = status.files?.filter(x=>x.working_dir === "M")?.map(x=> ({fileName:path.basename(x.path),path:x.path}));
        result.deleted = status.deleted?.map(x=> ({fileName:path.basename(x),path:x}));
        result.created = status.files?.filter(x=>x.working_dir === "?" && x.index === "?")?.map(x=> ({fileName:path.basename(x.path),path:x.path}));        
        result.current = status.current;
        result.isDetached = status.detached;
        result.headCommit = await this.getHeadCommit(git);
        return result;
    }

    private async getCommits(git: SimpleGit){
        const commitLimit=500;
        //const LogFormat = "--pretty="+LogFields.Hash+":%H%n"+LogFields.Abbrev_Hash+":%h%n"+LogFields.Parent_Hashes+":%p%n"+LogFields.Author_Name+":%an%n"+LogFields.Author_Email+":%ae%n"+LogFields.Date+":%ad%n"+LogFields.Ref+":%D%n"+LogFields.Message+":%s%n";
        try{
            let res = await git.raw(["log","--exclude=refs/stash", "--all",`--max-count=${commitLimit}`,`--skip=${0*commitLimit}`,"--date=iso-strict", this.LogFormat]);
            const commits = CommitParser.parse(res);
            return commits;
        }catch(e){
            console.error("error on get logs:", e);
        }
    
    }

    private async getAllBranches(git:SimpleGit){
        let result = await git.branch(["-av"]);
        let res = await git.status();
        return result.all;
    }

    private isDetachedCommit(commit:ICommitInfo,repoDetails:IRepositoryDetails){
        if(!commit.branchNameWithRemotes.length) return true;
        if(commit.branchNameWithRemotes.some(br=>br.branchName === commit.ownerBranch.name && !br.remote)) return false;
        if(repoDetails.branchList.includes(commit.ownerBranch.name)) return true;
        return true;
    }

    private async checkoutCommit(repoInfo:RepositoryInfo,options:string[],e: Electron.IpcMainEvent){
        const git = this.getGitRunner(repoInfo);
        try {            
            await git.checkout(options);  
            const status = await this.getStatus(repoInfo);
            e.reply(RendererEvents.checkoutCommit().replyChannel,status);
        }catch (error) {
            const errorSubStr = "Your local changes to the following files would be overwritten by checkout";
            const errorMsg:string = error?.toString() || "";
            console.log(`Failed to checkout:`+error?.toString());
            let errorToShow = errorMsg;
            if(errorMsg.includes(errorSubStr)){
                errorToShow ="There exist uncommited changes having conflicting state with checkout.";
            }
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,errorToShow); 
            return;
        }
        

        // commit.isHead = true;
        // const status = await this.getStatus(repoDetails.repoInfo);
        // e.reply(RendererEvents.checkoutCommit().replyChannel,commit,status);
    }

    private async createBranch(sourceCommit:ICommitInfo,repoDetails:IRepositoryDetails,newBranchName:string,checkout:boolean){
        const git = this.getGitRunner(repoDetails.repoInfo);
        try{
            if(checkout) await git.checkout(["-b", newBranchName,sourceCommit.hash]);
            else{
                await git.branch([newBranchName,sourceCommit.hash]);
            }
            const status = await this.getStatus(repoDetails.repoInfo);
            return status;
            // AppData.mainWindow.webContents.send(RendererEvents.refreshBranchPanel().channel);
        }catch(e){
            const errorStr = e+"";
            console.log(e);
            AppData.mainWindow.webContents.send(RendererEvents.showError().channel,errorStr);
        }
    }

    private async addPullHandler(){
        ipcMain.on(RendererEvents.pull().channel,async (e,repoDetails:IRepositoryDetails)=>{
            await this.takePull(repoDetails,e);
        });
    }

    private async addPushHandler(){
        ipcMain.on(RendererEvents.push().channel,async (e,repoDetails:IRepositoryDetails)=>{
            await this.givePush(repoDetails,e);
        });
    }

    private async addFetchHandler(){
        ipcMain.on(RendererEvents.fetch().channel,async (e,repoDetails:IRepositoryDetails,all:boolean)=>{
            await this.takeFetch(repoDetails,all,e);
        });
    }
    
    private hasChangesInPull(result:PullResult){
        if(!result) return false;
        if(result.created?.length) return true;
        if(result.deleted?.length) return true;
        if(result.summary?.changes) return true;
        if(result.summary.deletions) return true;
        if(result.summary.insertions) return true;
        return false;
    }

    private async takePull(repoDetails:IRepositoryDetails,e:Electron.IpcMainEvent){
        const git = this.getGitRunner(repoDetails.repoInfo);
        
        try {
            const result = await git.pull(repoDetails.remotes[0].name,repoDetails.headCommit.ownerBranch.name);
            if(this.hasChangesInPull(result)) AppData.mainWindow?.webContents.send(RendererEvents.refreshBranchPanel().channel)
            else e.reply(RendererEvents.pull().replyChannel);
        } catch (error) {
            console.log("Error on pull: "+ error?.toString());
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,error?.toString());
        }
    }

    private async takeFetch(repoDetails:IRepositoryDetails,all:boolean,e:Electron.IpcMainEvent){
        const git = this.getGitRunner(repoDetails.repoInfo);
        
        try {
            const options:string[]=[];
            if(all){
                options.push("--all");
            }
            else{
                options.push(repoDetails.remotes[0].name, repoDetails.headCommit.ownerBranch.name);
            }

            await git.fetch(options);
            console.log("fetched");
            if(all) AppData.mainWindow?.webContents.send(RendererEvents.refreshBranchPanel().channel)
            else {
                const status = await this.getStatus(repoDetails.repoInfo);
                if(repoDetails.status.behind !== status.behind ||repoDetails.status.ahead !== status.ahead){
                        AppData.mainWindow?.webContents.send(RendererEvents.refreshBranchPanel().channel);    
                }
                else e.reply(RendererEvents.fetch().replyChannel);
            }
        } catch (error) {
            console.log("Error on pull: "+ error?.toString());
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,error?.toString());
        }
    }

    private hasChangesInPush(result:PushResult){
        const hasChange = !!result.update?.hash;
        return hasChange;
    }

    private async givePush(repoDetails:IRepositoryDetails,e:Electron.IpcMainEvent){
        const git = this.getGitRunner(repoDetails.repoInfo);
        
        try {
            const result = await git.push(repoDetails.remotes[0].name,repoDetails.headCommit.ownerBranch.name);
            if(this.hasChangesInPush(result)) AppData.mainWindow?.webContents.send(RendererEvents.refreshBranchPanel().channel)
            else e.reply(RendererEvents.push().replyChannel);
        } catch (error) {
            console.log("Error on push: "+ error?.toString());
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,error?.toString());
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

    private async getHeadCommit(git:SimpleGit){        
        const showResult = await git.show([this.LogFormat]);        
        const commit = CommitParser.parse(showResult);        
        return commit?.[0];
    }


}