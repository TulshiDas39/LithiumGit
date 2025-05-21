import { RendererEvents, RepositoryInfo ,CreateRepositoryDetails, IRemoteInfo,IStatus, ICommitInfo, IRepositoryDetails, IFile, EnumChangeType, EnumChangeGroup, ILogFilterOptions, IPaginated, IActionTaken, IStash, IUserConfig, ITypedConfig, ICommitFilter, IHeadCommitInfo, IStatusConfig} from "common_library";
import { ipcMain } from "electron";
import { existsSync, readdirSync } from "fs-extra";
import simpleGit, { CleanOptions, PullResult, PushResult, SimpleGit, SimpleGitOptions, SimpleGitProgressEvent } from "simple-git";
import { AppData, LogFields } from "../dataClasses";
import { CommitParser } from "./CommitParser";
import * as path from 'path';
import * as fs from 'fs';
import { FileManager } from "./FileManager";
import { ConflictResolver } from "./ConflictResolver";
import * as os from 'os';

export class GitManager{
    private readonly logFields = LogFields.Fields();
    private readonly LogFormat = "--pretty="+this.logFields.Hash+":%H%n"+this.logFields.Abbrev_Hash+":%h%n"+this.logFields.Parent_Hashes+":%p%n"+this.logFields.Author_Name+":%an%n"+this.logFields.Author_Email+":%ae%n"+this.logFields.Date+":%ad%n"+this.logFields.Message+":%s%n"+this.logFields.Body+":%b%n"+this.logFields.Ref+":%D%n";
    start(){
        this.addEventHandlers();
    }

    private addEventHandlers(){
        this.addValidGitPathHandler();
        this.addCreateNewRepoHandler();
        this.addValidPathHandler();
        this.addRepoDetailsHandler();
        this.addLogHandler();
        this.addStatusHandler();
        this.addCloneRepositoryHandler();
        this.addStatusSyncHandler();
        this.addStageItemHandler();
        this.addUnStageItemHandler();
        this.addResetHandler();
        this.addDeleteLocalBranchHandler();
        this.addDiscardUnStagedItemHandler();
        this.addDiffHandler();
        this.addCheckOutCommitHandlder();
        this.addCreateBranchHandler();
        this.addPullHandler();
        this.addPushHandler();
        this.addFetchHandler();
        this.addCommitHandler();
        this.addGitShowHandler();
        this.addRawHandler();
        this.addMergeHandler();
        this.addCleanhHandler();
        this.addRemoteAddHandler();
        this.addRemoteHandler();
        this.addRemoteRemoveHandler();
        this.addRemoteListHandler();
        this.addRebaseHandler();
        this.addCherryPickHandler();
        this.addConflictResolveHandler();
        this.addGetStashListHandler();
        this.addStashHandler();
        this.addGitUserConfigHandler();
        this.addUserNameUpdateHandler();
        this.addUserEmailUpdateHandler();
        this.addGraphCommitListHandler();
        this.addIgnore();
        this.addRemoveFromGitHandler();
        this.addCommitDetailsHandler();
    }


    addMergeHandler(){
        ipcMain.handle(RendererEvents.gitMerge().channel, async (e,repoPath:string,options:string[])=>{
            const result = await this.merge(repoPath,options);
            return result;
        })
    }

    async merge(repoPath:string,options:string[]){
        const git = this.getGitRunner(repoPath);
        await git.merge(options);
    }

    private addGitShowHandler(){
        ipcMain.handle(RendererEvents.gitShow().channel, async (e,repoPath:string,options:string[])=>{
            const result = await this.getShowResult(repoPath,options);
            return result;
        })
    }

    private addGitUserConfigHandler(){
        ipcMain.handle(RendererEvents.getUserConfig, async (e,repoPath:string)=>{
            const result = await this.getUserConfig(repoPath);
            return result;
        })
    }

    private addUserNameUpdateHandler(){
        ipcMain.handle(RendererEvents.updateUserName, async (e,repoPath:string,value:string,isGlobal?:boolean)=>{
            const result = await this.updateUserName(repoPath,value,isGlobal);
            return result;
        })
    }

    private addUserEmailUpdateHandler(){
        ipcMain.handle(RendererEvents.updateUserEmail, async (e,repoPath:string,value:string,isGlobal?:boolean)=>{
            const result = await this.updateUserEmail(repoPath,value,isGlobal);
            return result;
        })
    }

    private addRawHandler(){
        ipcMain.handle(RendererEvents.gitRaw, async (e,repoPath:string, options:string[])=>{
            const result = await this.getRawResult(repoPath,options);
            return result;
        })
    }

    async getShowResult(repoPath:string,options:string[]){
        try {
            const git = this.getGitRunner(repoPath);
            const result = await git.show(options);   
            return result;
        } catch (error) {
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,error?.toString());
        }        
    }

    async updateUserName(repoPath:string,value:string,isGlobal?:boolean){
        const git = this.getGitRunner(repoPath);
        await git.addConfig("user.name",value,false, isGlobal?"global":"local");
    }

    async updateUserEmail(repoPath:string,value:string,isGlobal?:boolean){
        const git = this.getGitRunner(repoPath);
        await git.addConfig("user.email",value,false, isGlobal?"global":"local");
    }

    async getUserConfig(repoPath:string){
        const git = this.getGitRunner(repoPath);
        
        const localUser = {} as IUserConfig;
        let result = await git.getConfig("user.name","local");
        localUser.name = result.value;
        result = await git.getConfig("user.email","local");
        localUser.email = result.value;

        const globalUser = {} as IUserConfig;
        result = await git.getConfig("user.name","global");
        globalUser.name = result.value;
        result = await git.getConfig("user.email","global");
        globalUser.email = result.value;
        const userConfig:ITypedConfig<IUserConfig> = {
            local:localUser,
            global:globalUser
        }

        return userConfig;              
    }

    async getRawResult(repoPath:string, options:string[]){
        const git = this.getGitRunner(repoPath);
        const result = await git.raw(options);   
        return result;       
    }

    addCommitHandler(){
        ipcMain.handle(RendererEvents.commit().channel, async (e,repoPath:string, messages:string[],options:string[])=>{
            await this.giveCommit(repoPath, messages,options);            
        })
    }

    async giveCommit(repoPath:string, messages:string[],options:string[]){
        try {
            const git = this.getGitRunner(repoPath);            
            await git.commit(messages,options);
        } catch (error) {
            AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,error?.toString());
        }
        
    }

    addCreateBranchHandler(){
        ipcMain.handle(RendererEvents.createBranch().channel, async (e,sourceCommit:ICommitInfo,repository:IRepositoryDetails,newBranchName,checkout:boolean)=>{
            await this.createBranch(sourceCommit,repository,newBranchName,checkout);            
        })
    }
    private addRebaseHandler(){
        ipcMain.handle(RendererEvents.rebase, async (e,repoPath:string,options:string[])=>{
            await this.rebase(repoPath,options);
        })
    }
    addCheckOutCommitHandlder(){
        ipcMain.handle(RendererEvents.checkoutCommit().channel,async (e,repoPath:string,options:string[])=>{
            await this.checkoutCommit(repoPath,options);
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
    private addResetHandler() {
        ipcMain.handle(RendererEvents.reset, async(e,repoPath:string, options:string[])=>{
            await this.resetItem(repoPath,options);
        })
    }

    private addDeleteLocalBranchHandler() {
        ipcMain.handle(RendererEvents.deleteBranch, async(e,repoPath:string, branchName:string)=>{
            await this.delete(repoPath,branchName);
        })
    }

    private addStageItemHandler() {
        ipcMain.handle(RendererEvents.stageItem().channel, async(e,repoPath:string,paths:string[])=>{
            await this.stageItem(paths,repoPath);
        })
    }

    private async rebase(repoPath:string,options:string[]){
        const git = this.getGitRunner(repoPath);        
        await git.rebase(options);        
    }

    private async discardUnStageItem(paths:string[],repoInfo:RepositoryInfo){
        const git = this.getGitRunner(repoInfo);
        await git.checkout(['--',...paths]);
    }

    private async unStageItem(paths:string[],repoInfo:RepositoryInfo){
        const git = this.getGitRunner(repoInfo);
        const options = ['HEAD', ...paths];
        await git.reset(options);
    }

    private async resetItem(repoPath:string,options:string[]){
        const git = this.getGitRunner(repoPath);
        await git.reset(options);
    }

    private async delete(repoPath:string,branchNme:string){
        const git = this.getGitRunner(repoPath);
        await git.deleteLocalBranch(branchNme);
    }

    private async stageItem(path:string[],repoPath:string){
        const git = this.getGitRunner(repoPath);
        await git.add(path);
    }

    private addValidPathHandler(){
        ipcMain.on(RendererEvents.isValidPath,(e,path:string)=>{
            e.returnValue = existsSync(path);
        })
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

    private addCreateNewRepoHandler(){
        ipcMain.handle(RendererEvents.createNewRepo, async (e,path:string)=>{
            const git = this.getGitRunner(path);
            await git.init();
        })
    }

    private addRepoDetailsHandler(){
        ipcMain.handle(RendererEvents.getRepositoryDetails().channel, async (e,repoInfo:RepositoryInfo,filter:ICommitFilter)=>{
            const repoDetails = await this.repoDetails(repoInfo,filter);
            return repoDetails;
        });
    }

    private addGraphCommitListHandler(){
        ipcMain.handle(RendererEvents.getGraphCommits, async (e,repoPath:string,filter:ICommitFilter)=>{
            const git = this.getGitRunner(repoPath);
            const list = await this.getCommitsIteratively(git,filter);
            return list;
        });
    }    

    private addLogHandler(){
        ipcMain.handle(RendererEvents.gitLog, async (e,repoInfo:RepositoryInfo,filterOptions:ILogFilterOptions)=>{
            const repoDetails = await this.getFilteredCommits(repoInfo,filterOptions);
            return repoDetails;
        });
    }

    private addStatusHandler(){
        ipcMain.handle(RendererEvents.getStatus().channel, async (e,repoInfo:RepositoryInfo)=>{
            const result = await this.notifyStatus(repoInfo);
            return result;
        });
    }

    private addConflictResolveHandler(){
        ipcMain.handle(RendererEvents.ResolveConflict, async (e,repoPath:string,filePath:string,actions:IActionTaken[])=>{
            await this.resolveConflict(repoPath,filePath,actions);
        });
    }
    
    private resolveConflict(repoPath: string, filePath: string, actions: IActionTaken[]) {
        const fileAbsPath = path.join(repoPath,filePath);
        new ConflictResolver().resolveConflict(fileAbsPath,actions);
    }

    private addCloneRepositoryHandler(){
        ipcMain.handle(RendererEvents.cloneRepository, async (e,folderPath:string, url:string)=>{
            return await this.cloneRepository(folderPath,url);
        });
    }

    private addCherryPickHandler(){
        ipcMain.handle(RendererEvents.cherry_pick, async (e,repoPath:string,options:string[] )=>{
            await this.cherryPick(repoPath,options);
        });
    }

    private addStatusSyncHandler(){
        ipcMain.handle(RendererEvents.getStatusSync().channel, async (e,repoInfo:RepositoryInfo)=>{
            const status = await this.getStatus(repoInfo);
            return status;
        });
    }

    private setActiveOrigin(repoDetails:IRepositoryDetails){
        if(!repoDetails.remotes.length)
            return ;
        const defaultOrigin = repoDetails.repoInfo.activeOrigin;
        let origin = repoDetails.remotes.find(x => x.name === defaultOrigin);
        if(!origin) origin = repoDetails.remotes[0];
        repoDetails.repoInfo.activeOrigin = origin.name;
    }

    setHead(repoDetails:IRepositoryDetails){
        const status = repoDetails.status;
        const head = repoDetails.allCommits.find(x=>x.hash === status.headCommit.hash) as IHeadCommitInfo;
        if(!head) return;
        head.isHead = true;
        head.isDetached = status.headCommit.isDetached;
        repoDetails.headCommit = head;        
    }

    private async repoDetails(repoInfo:RepositoryInfo,filter:ICommitFilter){
        const repoDetails = CreateRepositoryDetails();
        repoDetails.repoInfo = repoInfo;
        const git = this.getGitRunner(repoInfo);
        repoDetails.status = await this.getStatus(repoInfo);        
        const commits = await this.getCommitsIteratively(git,filter);
        repoDetails.allCommits = commits;
        repoDetails.branchList = await this.getAllBranches(git);
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
        return status;
    }

    private async cloneRepository(folderPath:string,url:string){
        new FileManager().createPathIfNotExist(folderPath);
        const git = this.getGitRunner(folderPath,(data)=>{
            AppData.mainWindow?.webContents.send(RendererEvents.cloneProgress,data.progress,data.stage);
        });        
        return await git.clone(url,folderPath);
    }

    private async getStatus(repoInfo:RepositoryInfo,config?:IStatusConfig){
        const git = this.getGitRunner(repoInfo);
        const status = await git.status();
        const result = {
            staged:[],
            unstaged:[],
            conflicted:[],
            totalChangedItem:0,
        } as IStatus;
        const limit = 500;
        ///staged changes        
        let deleted = status.deleted.filter(x=>status.files.some(_=> _.path === x && _.index === 'D')).map<IFile>(x=> ({fileName:path.basename(x),path:x,changeType:EnumChangeType.DELETED,changeGroup:EnumChangeGroup.STAGED}));
        let modified = status.staged.filter(x=> status.files.some(_=> _.path === x && _.index === 'M')).map<IFile>(x=> ({fileName:path.basename(x),path:x,changeType:EnumChangeType.MODIFIED,changeGroup:EnumChangeGroup.STAGED}));
        let created = status.created.filter(_=> status.staged.includes(_)).map<IFile>(x=> ({fileName:path.basename(x),path:x,changeType:EnumChangeType.CREATED,changeGroup:EnumChangeGroup.STAGED}));        
        let renamed = status.renamed.map<IFile>(x=> ({
            fileName:path.basename(x.to),
            path:x.to,
            changeType:EnumChangeType.RENAMED,
            changeGroup:EnumChangeGroup.STAGED,
            oldPath:x.from,
            oldFileName:path.basename(x.from),
        }));        
        result.staged = [...modified,...created,...deleted,...renamed];
        result.totalStagedItem = result.staged.length;
        result.staged = result.staged.slice(0,limit);

        ///not staged changes
        deleted = status.deleted.filter(_=>!status.staged.includes(_)).map<IFile>(x=> ({fileName:path.basename(x),path:x,changeType:EnumChangeType.DELETED,changeGroup:EnumChangeGroup.UN_STAGED}));
        modified = status.files?.filter(x=>x.working_dir === "M")?.map(x=> ({fileName:path.basename(x.path),path:x.path,changeType:EnumChangeType.MODIFIED,changeGroup:EnumChangeGroup.UN_STAGED}));
        created = status.files?.filter(x=>x.working_dir === "?" && x.index === "?")?.map<IFile>(x=> ({fileName:path.basename(x.path),path:x.path,changeType:EnumChangeType.CREATED,changeGroup:EnumChangeGroup.UN_STAGED}));
        result.unstaged = [...modified,...created,...deleted];
        result.totalUnStagedItem = result.unstaged.length;
        result.unstaged = result.unstaged.slice(0,limit);

        result.ahead = status.ahead;
        result.behind = status.behind;        
        result.conflicted = status.conflicted?.slice(0,limit).map<IFile>(x=> ({fileName:path.basename(x),path:x,changeType:EnumChangeType.CONFLICTED,changeGroup:EnumChangeGroup.CONFLICTED}));
        result.totalConflictedItem = status.conflicted?.length || 0;
        result.isClean = status?.isClean();
        result.current = status.current;
        result.isDetached = status.detached;
        if(status.tracking){
            result.trackingBranch = status.tracking.substring(status.tracking.indexOf("/")+1);
        }

        result.totalChangedItem = result.unstaged.length + result.staged.length + result.conflicted.length;
        
        result.headCommit = (await this.getCommitInfo(git,undefined)) as IHeadCommitInfo;
        if(!result.headCommit)
            return result;
        result.headCommit.isDetached = status.detached;
        result.mergingCommitHash = await this.getMergingInfo(git);
        if(!result.mergingCommitHash){
            result.rebasingCommit = await this.getCommitInfo(git,"REBASE_HEAD");
            if(!result.rebasingCommit){
                result.cherryPickingCommit = await this.getCommitInfo(git, "CHERRY_PICK_HEAD");
            }
        }
        
        return result;
    }

    private async cherryPick(repoPath:string, options:string[]){
        const git = this.getGitRunner(repoPath);
        await git.raw(["cherry-pick",...options]);
    }
    
    private async getMergingInfo(git:SimpleGit){
        try {
            const result = await git.revparse(["-q", "--verify", "MERGE_HEAD"]);            
            return result;
        } catch (error) {
            return null;
        }
    }

    private async getRebaseInfo(git:SimpleGit){
        try {
            const result = await git.revparse(["-q", "--verify", "REBASE_HEAD"]);            
            return result;
        } catch (error) {
            return null;
        }
    }

    private getFilterOptions(filter:ICommitFilter){
        const options = [];
        if(filter.toDate){
           options.push(`--before=${filter.toDate}`);
        }
        if(filter.fromDate){
            options.push(`--after=${filter.fromDate}`);
        }
        if(filter.limit){
            options.push(`--max-count=${filter.limit}`);
        }
        return options;
    }

    private async getCommitsIteratively(git: SimpleGit,filter:ICommitFilter){        
        if(filter.fromDate || filter.toDate)
            return await this.getCommits(git,filter);
        
        if(!filter.limit || !filter.baseDate)
            throw "Limit or base date cannot be null.";

        let newFilter:ICommitFilter = {
            toDate:filter.baseDate!,
            limit:filter.limit,
            userModified:false,
        }

        let preCommits = await this.getCommits(git,newFilter);
        let newLimit = filter.limit/2;
        if(preCommits.length < filter.limit / 2){
            newLimit +=  (filter.limit / 2) - preCommits.length;
        }

        const toDate = new Date(filter.baseDate);
        toDate.setMonth(toDate.getMonth()+5);

        newFilter = {
            fromDate:filter.baseDate,
            toDate:toDate.toISOString(),
            userModified:false,
            firstItems:true,
        };

        
        let postCommits = await this.getCommits(git,newFilter);
        const preCommitHashes = preCommits.map(_=> _.hash);
        postCommits = postCommits.filter(_=> !preCommitHashes.includes(_.hash));
        let postStartIndex = 0;
        if(preCommits.length){
            const preLastCommitHash = preCommits[preCommits.length -1].hash;
            postStartIndex = postCommits.findIndex(_ => _.hash === preLastCommitHash) + 1;
        }
        postCommits = postCommits.slice(postStartIndex);
        let total = preCommits.length + postCommits.length;
        if(total > filter.limit){
            let extra = total - filter.limit;
            if(preCommits.length > filter.limit / 2 ){
                let preCommitExtra = preCommits.length - (filter.limit / 2);
                preCommitExtra = Math.min(extra,preCommitExtra);
                preCommits = preCommits.slice(preCommitExtra);
            }
            total = preCommits.length + postCommits.length;
            extra = total - filter.limit;
            if(postCommits.length > filter.limit / 2 ){
                let postCommitExtra = postCommits.length - (filter.limit / 2);
                postCommitExtra = Math.min(extra,postCommitExtra);
                postCommits = postCommits.slice(0, postCommits.length - postCommitExtra);
            }
        }
        

        const allCommits = [...preCommits,...postCommits];

        return allCommits;

    }

    private async getCommits(git: SimpleGit,filter:ICommitFilter){
        //const LogFormat = "--pretty="+logFields.Hash+":%H%n"+LogFields.Abbrev_Hash+":%h%n"+LogFields.Parent_Hashes+":%p%n"+LogFields.Author_Name+":%an%n"+LogFields.Author_Email+":%ae%n"+LogFields.Date+":%ad%n"+LogFields.Ref+":%D%n"+LogFields.Message+":%s%n";
        try{
            //--`--skip=${0*commitLimit}`
            const filterOptions = this.getFilterOptions(filter);
            const options = ["log","--exclude=refs/stash", "--all",...filterOptions,"--date=iso-strict","--date-order", this.LogFormat];            
            let res = await git.raw(options);
            const commits = CommitParser.parse(res);
            return commits;            
        }catch(e){
            console.error("error on get logs:", e);
        }
    
    }

    private async getFilteredCommits(repoInfo:RepositoryInfo,filterOption:ILogFilterOptions){
        const git = this.getGitRunner(repoInfo);
        const options = ["log","--exclude=refs/stash","--date=iso-strict","--no-notes"];
        if(filterOption.pageSize){
            options.push(`--max-count=${filterOption.pageSize}`);
            if(filterOption.pageIndex){
                options.push(`--skip=${filterOption.pageIndex*filterOption.pageSize}`);
            }
        }
        if(filterOption.hash){
            options.push(filterOption.hash);
        }
        if(filterOption.message){
            options.push(`--grep=${filterOption.message}`);
        }        
        if(filterOption.branchName){
            options.push(`--first-parent`,`${filterOption.branchName}`, "--no-merges");
        }
        else{
            if(!filterOption.hash) 
                options.push("--all");
        }

        options.push(this.LogFormat);

        try{
            let res = await git.raw(options);
            const commits = CommitParser.parse(res);
            const count = await this.getTotalCommitCount(repoInfo,filterOption);
            const result:IPaginated<ICommitInfo>={
                count,
                list:commits
            };
            return result;
        }catch(e){
            console.error("error on get logs:", e);
            const result:IPaginated<ICommitInfo>={
                count:0,
                list:[]
            };
            return result;
        }
    
    }

    private async getTotalCommitCount(repoInfo:RepositoryInfo,filterOption:ILogFilterOptions){
        const git = this.getGitRunner(repoInfo);
        const options = ["rev-list","--count","--exclude=refs/stash"];
        if(filterOption.hash){
            options.push(filterOption.hash,"-1");
        }
        if(filterOption.message){
            options.push(`--grep=${filterOption.message}`);
        }
        if(filterOption.branchName){
            options.push(`--first-parent`,`${filterOption.branchName}`,"--no-merges");
        }
        else{
            options.push("--all");
        }
        try{
            let res = await git.raw(options);
            return Number(res);
        }catch(e){
            console.error("error on get logs:", e);
        }

    }

    private async getAllBranches(git:SimpleGit){
        let result = await git.branch(["-av"]);
        return result.all;
    }

    private async checkoutCommit(repoPath:string,options:string[]){
        const git = this.getGitRunner(repoPath);
        await git.checkout(options);  
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
        ipcMain.handle(RendererEvents.pull().channel,async (e,repoPath:string,options:string[])=>{
            await this.takePull(repoPath,options);
        });
    }

    private async addGetStashListHandler(){
        ipcMain.handle(RendererEvents.stashes,async (e,repoPath:string,options:string[])=>{
            return await this.getStashList(repoPath,options);
        });
    }

    private async addStashHandler(){
        ipcMain.handle(RendererEvents.stash,async (e,repoPath:string,options:string[])=>{
            await this.stash(repoPath,options);
        });
    }

    private addPushHandler(){
        ipcMain.handle(RendererEvents.push().channel,async (e,repoPath:string,options:string[])=>{
            await this.givePush(repoPath ,options);
        });
    }

    private addFetchHandler(){
        ipcMain.handle(RendererEvents.fetch().channel,async (e,repoPath:string,options:string[])=>{
            await this.takeFetch(repoPath,options);            
        });
    }

    private addIgnore(){
        ipcMain.handle(RendererEvents.ignoreItem,async (_e,repoPath:string,pattern:string)=>{
            return await this.ignoreItem(repoPath,pattern);
        });
    }

    private ignoreItem(repoPath:string,pattern:string){
        const gitIgnore = path.join(repoPath,".gitignore");
        const exists = fs.existsSync(gitIgnore);
        let data = `${pattern}`;
        if(exists){
            data = `${os.EOL}${data}`;
        }
        return new Promise<boolean>((res,rej)=>{
            fs.writeFile(gitIgnore,data,{flag:'a+'},(err)=>{
                if(err){
                    rej(err);
                }else{
                    res(true);
                }
           });

        })
        
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

    private addRemoteHandler(){
        ipcMain.handle(RendererEvents.remote,async (e,repoPath:string,options:string[])=>{
            const git = this.getGitRunner(repoPath);
            const r = await git.remote(options);
            return r;
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

    private addRemoveFromGitHandler(){
        ipcMain.handle(RendererEvents.deleteFromGit,async (e,repoPath:string,options:string[])=>{
            return await this.deleteFromGit(repoPath,options);
        })
    }

    private addCommitDetailsHandler(){        
        ipcMain.handle(RendererEvents.getCommitDetails, async (e,repoPath:string,hash:string)=>{
            const git = this.getGitRunner(repoPath);
            return await this.getCommitInfo(git,hash,{includeBranchList:true});
        })
    }

    private async deleteFromGit(repoPath:string,options:string[]){
        const git = this.getGitRunner(repoPath);
        return await git.raw(["rm",...options]);
    }



    private async cleanFiles(repoInfo:RepositoryInfo,files:string[]){
        const git = this.getGitRunner(repoInfo);
        await git.clean(CleanOptions.FORCE,files);
    }

    private async addRemote(repoInfo:RepositoryInfo, remote:IRemoteInfo){
        const git = this.getGitRunner(repoInfo);
        await git.addRemote(remote.name,remote.url);
    }

    private async updateRemote(repPath:string,name:string, url:string){
        const git = this.getGitRunner(repPath);
        const options = ["set-url",name,url];
        await git.remote(options);
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

    private async getStashList(repoPath:string,options:string[]){
        const git = this.getGitRunner(repoPath);
        const r = await git.stashList(options);
        const stashList:IStash[] = [];
        let index = 0;        
        for(let item of r.all){
            const st:IStash = {
                message:item.message,
                body:item.body,
                authEmail:item.author_email,
                authorName:item.author_name,
                date:item.date,
                hash:item.hash,
                avrebHash:item.hash.substring(0,7),
                changedCount:0,
                index:index,
                insertion:0,
                deletion:0
            };
            if(item.diff){
                st.changedCount = item.diff.changed + item.diff.insertions + item.diff.deletions;                
                st.insertion = item.diff.insertions;
                st.deletion = item.diff.deletions;
            }            
            stashList.push(st);
            index++;
        }        

        return stashList;      
    }

    private async stash(repoPath:string,options:string[]){
        const git = this.getGitRunner(repoPath);
        await git.stash(options);             
    }

    private async takePull(repoPath:string,options:string[]){
        const git = this.getGitRunner(repoPath);    
        await git.pull(options);
    }  

    private async takeFetch(repoPath:string,options:string[]){
        const git = this.getGitRunner(repoPath);        
        await git.fetch(options);                
    }

    private async givePush(repoPath:string,options:string[]){
        const git = this.getGitRunner(repoPath);
        await git.push(options);        
    }


    private getGitRunner(repoInfo:RepositoryInfo | string,progress?:(data:SimpleGitProgressEvent)=>void){
        let repoPath = "";
        if(typeof(repoInfo) === 'string'){
            repoPath = repoInfo as string;
        }
        else{
            repoPath = (repoInfo as RepositoryInfo).path;
        }
        const options: Partial<SimpleGitOptions> = {
            baseDir: repoPath,
            binary: 'git',
            maxConcurrentProcesses: 6,
            progress
         };
        let git = simpleGit(options);  
        return git;
    }

    private async getCommitInfo(git:SimpleGit,commitHash:string|undefined,config?:{includeBranchList?:boolean}){
        const options:string[] = [];
        if(commitHash) options.push(commitHash);
        options.push(this.LogFormat);
        let commits:ICommitInfo[] = [];
        try{
            const showResult = await git.show(options);        
            commits = CommitParser.parse(showResult);        
        }catch(e){
            return null!;
        }
        
        const c = commits?.[0];

        if(!c)
            return c;
        if(config?.includeBranchList){
            const containingBranches = await this.getContainingBranches(git,c.hash);
            c.containingBranches = containingBranches;
        }        

        return c;
    }

    private async getContainingBranches(git:SimpleGit,hash:string){
        try{
            //git branch -a --contains a1b2c3d4
            const options = ["-a","--contains",hash];
            const r = await git.branch(options);
            return r.all;
        }catch(e){
            return [];
        }
    }


}