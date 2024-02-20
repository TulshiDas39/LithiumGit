import { RendererEvents, RepositoryInfo ,CreateRepositoryDetails, IRemoteInfo,IStatus, ICommitInfo, IRepositoryDetails, IChanges, IFile, EnumChangeType, EnumChangeGroup} from "common_library";
import { ipcMain, ipcRenderer } from "electron";
import { existsSync, readdirSync } from "fs-extra";
import simpleGit, { CleanOptions, FetchResult, PullResult, PushResult, SimpleGit, SimpleGitOptions } from "simple-git";
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
        this.addStatusSyncHandler();
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
        this.addCleanhHandler();
        this.addRemoteAddHandler();
        this.addRemoteRemoveHandler();
        this.addRemoteListHandler();
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
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,errStr);
            return null;
        }
        
    }

    addGitShowHandler(){
        ipcMain.handle(RendererEvents.gitShow().channel, async (e,repository:RepositoryInfo,options:string[])=>{
            const result = await this.getShowResult(repository,options);
            return result;
        })
    }

    async getShowResult(repository:RepositoryInfo,options:string[]){
        try {
            const git = this.getGitRunner(repository);
            const result = await git.show(options);   
            return result;
        } catch (error) {
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,error?.toString());
        }        
    }

    addCommitHandler(){
        ipcMain.handle(RendererEvents.commit().channel, async (e,repository:RepositoryInfo,message:string)=>{
            await this.giveCommit(repository,message);            
        })
    }

    async giveCommit(repository:RepositoryInfo,message:string){
        try {
            const git = this.getGitRunner(repository);            
            await git.commit(message);            
        } catch (error) {
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,error?.toString());
        }
        
    }

    addCreateBranchHandler(){
        ipcMain.handle(RendererEvents.createBranch().channel, async (e,sourceCommit:ICommitInfo,repository:IRepositoryDetails,newBranchName,checkout:boolean)=>{
            await this.createBranch(sourceCommit,repository,newBranchName,checkout);            
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
        ipcMain.handle(RendererEvents.diff().channel, async(e,options:string[],repoInfo:RepositoryInfo)=>{
            const res = await this.getDiff(options,repoInfo);
            return res;
        })
    }
    async getDiff(options: string[], repoInfo: RepositoryInfo) {
        const git = this.getGitRunner(repoInfo);        
        const result = await git.diff(options);
        AppData.mainWindow.webContents.send(RendererEvents.logger,result);
        return result;
    }

    private addDiscardUnStagedItemHandler() {
        ipcMain.handle(RendererEvents.discardItem().channel, async(e,paths:string[],repoInfo:RepositoryInfo)=>{
            await this.discardUnStageItem(paths,repoInfo);            
        })
    }
    private addUnStageItemHandler() {
        ipcMain.handle(RendererEvents.unStageItem().channel, async(e,paths:string[],repoInfo:RepositoryInfo)=>{
            await this.unStageItem(paths,repoInfo);            
        })
    }
    private addStageItemHandler() {
        ipcMain.handle(RendererEvents.stageItem().channel, async(e,paths:string[],repoInfo:RepositoryInfo)=>{
            await this.stageItem(paths,repoInfo);
        })
    }

    private async discardUnStageItem(paths:string[],repoInfo:RepositoryInfo){
        const git = this.getGitRunner(repoInfo);
        await git.checkout(['--',...paths]);
    }

    private async unStageItem(paths:string[],repoInfo:RepositoryInfo){
        const git = this.getGitRunner(repoInfo);
        await git.reset(['head', ...paths]);
    }

    private async stageItem(path:string[],repoInfo:RepositoryInfo){
        const git = this.getGitRunner(repoInfo);
        await git.add(path);
    }

    private addValidGitPathHandler(){
        ipcMain.on(RendererEvents.isValidRepoPath,(e,path:string)=>{
            if(!existsSync(path)) {
                e.returnValue = false;
                return;
            }
            const subDirNames = readdirSync(path, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
            
            if(subDirNames.every(name=> name !== ".git")) e.returnValue = false;
            else e.returnValue = true;
        })        
    }

    private addRepoDetailsHandler(){
        ipcMain.handle(RendererEvents.getRepositoryDetails().channel, async (e,repoInfo:RepositoryInfo)=>{
            const repoDetails = await this.repoDetails(repoInfo);
            return repoDetails;
        });
    }

    private addStatusHandler(){
        ipcMain.handle(RendererEvents.getStatus().channel, async (e,repoInfo:RepositoryInfo)=>{
            await this.notifyStatus(repoInfo);
        });
    }

    private addStatusSyncHandler(){
        ipcMain.handle(RendererEvents.getStatusSync().channel, async (e,repoInfo:RepositoryInfo)=>{
            const status = await this.getStatus(repoInfo);
            return status;
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

    private async notifyStatus(repoInfo:RepositoryInfo){
        const status = await this.getStatus(repoInfo);
        AppData.mainWindow?.webContents.send(RendererEvents.getStatus().replyChannel,status);
    }

    private async getStatus(repoInfo:RepositoryInfo){
        const git = this.getGitRunner(repoInfo);
        const status = await git.status();
        const result = {
            staged:[],
            unstaged:[],
            conflicted:[],
            totalChangedItem:0,
        } as IStatus;
        ///staged changes
        let deleted = status.deleted.filter(x=>status.files.some(_=> _.path === x && _.index === 'D')).map<IFile>(x=> ({fileName:path.basename(x),path:x,changeType:EnumChangeType.DELETED,changeGroup:EnumChangeGroup.STAGED}));
        let modified = status.staged.filter(x=> status.files.some(_=> _.path === x && _.index === 'M')).map<IFile>(x=> ({fileName:path.basename(x),path:x,changeType:EnumChangeType.MODIFIED,changeGroup:EnumChangeGroup.STAGED}));
        let created = status.created.filter(_=> status.staged.includes(_)).map<IFile>(x=> ({fileName:path.basename(x),path:x,changeType:EnumChangeType.CREATED,changeGroup:EnumChangeGroup.STAGED}));
        result.staged = [...modified,...created,...deleted];

        ///not staged changes
        deleted = status.deleted.filter(_=>!status.staged.includes(_)).map<IFile>(x=> ({fileName:path.basename(x),path:x,changeType:EnumChangeType.DELETED,changeGroup:EnumChangeGroup.UN_STAGED}));
        modified = status.files?.filter(x=>x.working_dir === "M")?.map(x=> ({fileName:path.basename(x.path),path:x.path,changeType:EnumChangeType.MODIFIED,changeGroup:EnumChangeGroup.UN_STAGED}));
        created = status.files?.filter(x=>x.working_dir === "?" && x.index === "?")?.map<IFile>(x=> ({fileName:path.basename(x.path),path:x.path,changeType:EnumChangeType.CREATED,changeGroup:EnumChangeGroup.UN_STAGED}));
        result.unstaged = [...modified,...created,...deleted]

        result.ahead = status.ahead;
        result.behind = status.behind;        
        result.conflicted = status.conflicted?.map<IFile>(x=> ({fileName:path.basename(x),path:x,changeType:EnumChangeType.CONFLICTED,changeGroup:EnumChangeGroup.STAGED}));
        result.isClean = status?.isClean();
        result.current = status.current;
        result.isDetached = status.detached;
        if(status.tracking){
            result.trackingBranch = status.tracking.substring(status.tracking.indexOf("/")+1);
        }

        result.totalChangedItem = result.unstaged.length + result.staged.length + result.conflicted.length;
        
        result.headCommit = await this.getCommitInfo(git,undefined);
        result.mergingCommitHash = await this.getMergingInfo(git);
        return result;
    }

    private async getMergingInfo(git:SimpleGit){
        try {
            const result = await git.revparse(["-q", "--verify", "MERGE_HEAD"]);            
            return result;
        } catch (error) {
            return null;
        }
    }

    private async getCommits(git: SimpleGit){
        const commitLimit=500;
        //const LogFormat = "--pretty="+LogFields.Hash+":%H%n"+LogFields.Abbrev_Hash+":%h%n"+LogFields.Parent_Hashes+":%p%n"+LogFields.Author_Name+":%an%n"+LogFields.Author_Email+":%ae%n"+LogFields.Date+":%ad%n"+LogFields.Ref+":%D%n"+LogFields.Message+":%s%n";
        try{
            let res = await git.raw(["log","--exclude=refs/stash", "--all",`--max-count=${commitLimit}`,`--skip=${0*commitLimit}`,"--date=iso-strict","--topo-order", this.LogFormat]);
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
        }catch(e){
            const errorStr = e+"";
            AppData.mainWindow.webContents.send(RendererEvents.showError().channel,errorStr);
        }
    }

    private async addPullHandler(){
        ipcMain.on(RendererEvents.pull().channel,async (e,repoDetails:IRepositoryDetails)=>{
            await this.takePull(repoDetails,e);
        });
    }

    private addPushHandler(){
        ipcMain.handle(RendererEvents.push().channel,async (e,repoDetails:IRepositoryDetails)=>{
            await this.givePush(repoDetails);
        });
    }

    private  addFetchHandler(){
        ipcMain.handle(RendererEvents.fetch().channel,async (e,repoDetails:IRepositoryDetails,all:boolean)=>{
            await this.takeFetch(repoDetails,all);
        });
    }

    private addCleanhHandler(){
        ipcMain.handle(RendererEvents.gitClean().channel,async (e,repoInfo:RepositoryInfo,files:string[])=>{
            await this.cleanFiles(repoInfo,files);
        });
    }

    private addRemoteAddHandler(){
        ipcMain.handle(RendererEvents.gitAddRemote().channel,async (e,repoInfo:RepositoryInfo,remote:IRemoteInfo)=>{
            await this.addRemote(repoInfo, remote);
        })
    }

    private addRemoteRemoveHandler(){
        ipcMain.handle(RendererEvents.gitRemoveRemote,async (e,repoInfo:RepositoryInfo,remoteName:string)=>{
            await this.removeRemote(repoInfo, remoteName);
        })
    }

    private addRemoteListHandler(){
        ipcMain.handle(RendererEvents.gitGetRemoteList().channel,async (e,repoInfo:RepositoryInfo)=>{
            return await this.getRemotes(repoInfo);
        })
    }

    private async cleanFiles(repoInfo:RepositoryInfo,files:string[]){
        const git = this.getGitRunner(repoInfo);
        await git.clean(CleanOptions.FORCE,files);
    }

    private async addRemote(repoInfo:RepositoryInfo, remote:IRemoteInfo){
        const git = this.getGitRunner(repoInfo);
        await git.addRemote(remote.name,remote.url);
    }

    private async removeRemote(repoInfo:RepositoryInfo, remoteName:string){
        const git = this.getGitRunner(repoInfo);
        await git.removeRemote(remoteName);
    }

    private async getRemotes(repoInfo:RepositoryInfo){
        const git = this.getGitRunner(repoInfo);
        const remotes:IRemoteInfo[] = [];
        const result = await git.getRemotes(true);        
        result.forEach(r=>{
            const remote:IRemoteInfo = {
                name:r.name,
                url:r.refs.fetch || r.refs.push,
                actionTyps:[]
            };
            if(!!r.refs.fetch) remote.actionTyps.push("fetch");
            if(!!r.refs.push) remote.actionTyps.push("push");
            remotes.push(remote);
        });

        return remotes;
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
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,error?.toString());
        }
    }

    private async takeFetch(repoDetails:IRepositoryDetails,all:boolean){
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
        } catch (error) {
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,error?.toString());
        }
    }

    private hasChangesInPush(result:PushResult){
        const hasChange = !!result.update?.hash;
        return hasChange;
    }

    private async givePush(repoDetails:IRepositoryDetails){
        const git = this.getGitRunner(repoDetails.repoInfo);
        
        try {
            const options:string[] = [repoDetails.remotes[0].name];
            if(!repoDetails.status.trackingBranch)
                options.push("-u",repoDetails.headCommit.ownerBranch.name);            
            const result = await git.push(options);
            if(this.hasChangesInPush(result)) AppData.mainWindow?.webContents.send(RendererEvents.refreshBranchPanel().channel)           
        } catch (error) {
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

    private async getCommitInfo(git:SimpleGit,commitHash:string|undefined){
        const options:string[] = [];
        if(commitHash) options.push(commitHash);
        options.push(this.LogFormat);
        const showResult = await git.show(options);        
        const commit = CommitParser.parse(showResult);        
        return commit?.[0];
    }


}