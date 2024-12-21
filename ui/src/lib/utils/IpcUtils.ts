import { Annotation, IActionTaken, ICommitFilter, ICommitInfo, IConfigInfo, ILogFilterOptions, INotification, IPaginated, IRemoteInfo, IRepositoryDetails, IStash, IStatus, ITypedConfig, IUserConfig, RendererEvents, RepositoryInfo } from "common_library";
import { RepoUtils } from "./RepoUtils";
import { IpcResult } from "../interfaces/IpcResult";
import { IUiNotification } from "../interfaces";

export class IpcUtils{
    static checkForUpdate() {
        return IpcUtils.execute(RendererEvents.checkForUpdate,[]);
    }
    static updateNotifications(items: INotification[]) {
        return IpcUtils.execute(RendererEvents.updateNotifications,[items]);
    }
    static deleteNotification(items: INotification[]) {
        return IpcUtils.execute(RendererEvents.deleteNotifcations,[items]);        
    }
    static clearNotifications() {
        return IpcUtils.execute(RendererEvents.clearNotifications,[]);
    }
    static runRemote(options:string[]) {
        return this.runGitCommand(RendererEvents.remote,[options]);
    }

    static abortRebase() {
        const options = ["--abort"];
        return IpcUtils.runGitCommand(RendererEvents.rebase, [options]);
    }

    static skipRebase() {
        const options = ["--skip"];
        return IpcUtils.runGitCommand(RendererEvents.rebase, [options],{preventErrorDisplay:true});
    }

    static continueCherryPick() {
        const options = ["-c","core.editor=true","cherry-pick","--continue"];
        return IpcUtils.runGitCommand(RendererEvents.gitRaw, [options]);
    }

    static continueRebase() {
        const options = ["-c","core.editor=true","rebase","--continue"];
        return IpcUtils.runGitCommand(RendererEvents.gitRaw, [options],{preventErrorDisplay:true});
    }
    static async getGraphCommitList(filter: ICommitFilter) {
        const r = await IpcUtils.runGitCommand<ICommitInfo[]>(RendererEvents.getGraphCommits,[filter]);
        if(!r.error)
            return r.result!;
        return [];
    }
    static updateUserEmail(value: string, isGlobal?:boolean) {
        return IpcUtils.runGitCommand<any>(RendererEvents.updateUserEmail,[value,isGlobal]);
    }
    static updateUserName(value: string,isGlobal?:boolean) {
        return IpcUtils.runGitCommand<any>(RendererEvents.updateUserName,[value,isGlobal]);
    }
    static getUserConfig() {
        return IpcUtils.runGitCommand<ITypedConfig<IUserConfig>>(RendererEvents.getUserConfig,[]);
    }
    static runStash(options: string[]) {
        return IpcUtils.runGitCommand(RendererEvents.stash,[options]);
    }
    
    static getStashes() {
        return IpcUtils.runGitCommand<IStash[]>(RendererEvents.stashes,[]);
    }
    private static removeJSPartFromError(err:string){
        if(!err)
            return err;
        const prefix = "error: error invoking remote method";
        if(err.toLowerCase().startsWith(prefix)){
            return err.substring(err.lastIndexOf('Error:'))
        }
        return err;
    }
    static async getLastUpdatedDate(path: string) {
        const fullPath = await this.joinPathAsync(RepoUtils.selectedRepo.path,path);
        const r = await this.execute<string>(RendererEvents.lastUpdatedDate,[fullPath]);
        return r.result || "";
    }
    static resolveConflict(path: string, actions:IActionTaken[]) {
        return IpcUtils.runGitCommand(RendererEvents.ResolveConflict,[path,actions]);
    }
    static registerHandler(channel:string,handler:(...args:any[])=>void){
        window.ipcRenderer.on(channel,handler);
    }
    static checkout(options: string[]) {
        return IpcUtils.runGitCommand(RendererEvents.checkoutCommit().channel,[options]);
    }
    static initNewRepo(path:string){
        return IpcUtils.execute(RendererEvents.createNewRepo,[path]);
    }
    static browseFolderPath(){
        return IpcUtils.execute<string>(RendererEvents.getDirectoryPath().channel,[]);
    }
    static showInFileExplorer(path:string){        
        return IpcUtils.execute(RendererEvents.openFileExplorer,[path]);        
    }
    static cloneRepository(url: string, directory: string) {
        return IpcUtils.execute(RendererEvents.cloneRepository,[directory,url]);
    }
    static getRaw(options: string[]) {
        return IpcUtils.runGitCommand<string>(RendererEvents.gitRaw,[options]);
    }
    static getRepoStatus(repoInfo?:RepositoryInfo){
        if(!repoInfo)
            repoInfo = RepoUtils.selectedRepo;
        return window.ipcRenderer.invoke(RendererEvents.getStatus().channel,repoInfo) as Promise<IStatus>;
    }

    static async getRepoStatusSync(repoInfo?:RepositoryInfo){
        if(!repoInfo)
            repoInfo = RepoUtils.selectedRepo;
        const status:IStatus = await window.ipcRenderer.invoke(RendererEvents.getStatusSync().channel,repoInfo);
        return status;
    }

    static trigerPush(options?:string[]){
        if(!options){
            options = [RepoUtils.activeOriginName];
            if(!RepoUtils.repositoryDetails.status.trackingBranch){
                const br = RepoUtils.repositoryDetails.headCommit?.ownerBranch.name;
                if(br){
                    options.push("-u",br);
                }
            }
        }
        return IpcUtils.runGitCommand(RendererEvents.push().channel,[options])        
    }

    static trigerPull(options?:string[]){
        if(!options){
            options = [RepoUtils.activeOriginName];
            if(!RepoUtils.repositoryDetails.status.trackingBranch){
                const br = RepoUtils.repositoryDetails.headCommit?.ownerBranch.name;
                if(br){
                    options.push(br);
                }
            }
        }
        return IpcUtils.runGitCommand(RendererEvents.pull().channel,[options])        
    }

    static unstageItem(paths:string[],repoInfo:RepositoryInfo){
        return window.ipcRenderer.invoke(RendererEvents.unStageItem().channel,paths,repoInfo);
    }

    static stageItems(paths:string[]){
        return IpcUtils.runGitCommand(RendererEvents.stageItem().channel,[paths]);        
    }

    static merge(options:string[]){
        return IpcUtils.runGitCommand(RendererEvents.gitMerge().channel,[options]);        
    }

    static discardItems(paths:string[],repoInfo:RepositoryInfo){
        return window.ipcRenderer.invoke(RendererEvents.discardItem().channel,paths,repoInfo);
    }

    static cleanItems(paths:string[],repoInfo:RepositoryInfo){
        return window.ipcRenderer.invoke(RendererEvents.gitClean().channel,repoInfo,paths);
    }

    static doCommit(messages:string[],options:string[]){        
        return IpcUtils.runGitCommand(RendererEvents.commit().channel,[messages,options]);
    }

    static createBranch(branchName:string,sourceCommit:ICommitInfo,checkout:boolean){
        return window.ipcRenderer.invoke(RendererEvents.createBranch().channel, sourceCommit,RepoUtils.repositoryDetails,branchName,checkout);
    }

    static fetch(options:string[]){
        return IpcUtils.runGitCommand(RendererEvents.fetch().channel,[options]);
    }

    static async getFileContent(path:string){
        return await window.ipcRenderer.invoke(RendererEvents.getFileContent().channel,path) as string[];
    }

    static async getDiff(options:string[]){
        return await window.ipcRenderer.invoke(RendererEvents.diff().channel,options,RepoUtils.selectedRepo) as string;
    }

    static async getGitShowResult(options:string[]){
        return await window.ipcRenderer.invoke(RendererEvents.gitShow().channel,RepoUtils.selectedRepo,options) as string;
    }
    
    static async reset(options:string[]){
        return IpcUtils.runGitCommand(RendererEvents.reset,[options]);
    }

    static async deleteLocalBranch(branchName:string){
        return IpcUtils.runGitCommand(RendererEvents.deleteBranch,[branchName]);
    }

    static async getGitShowResultOfStagedFile(path:string){
        const options = [":"+path];
        return IpcUtils.runGitCommand<string>(RendererEvents.gitShow().channel,[options]);
    }

    static async getFileContentAtSpecificCommit(commitHash:string, path:string){
        const options = [`${commitHash}:${path}`];
        return IpcUtils.runGitCommand<string>(RendererEvents.gitShow().channel,[options]);
    }

    static async addRemote(remote:IRemoteInfo){
        await window.ipcRenderer.invoke(RendererEvents.gitAddRemote().channel,RepoUtils.selectedRepo,remote);
    }

    static async removeRemote(remoteName:string){
        return IpcUtils.execute(RendererEvents.gitRemoveRemote,[RepoUtils.selectedRepo,remoteName]);        
    }

    static async getRemoteList(){
        return await window.ipcRenderer.invoke(RendererEvents.gitGetRemoteList().channel,RepoUtils.selectedRepo) as IRemoteInfo[];
    }

    static async getCommitList(filterOptions:ILogFilterOptions){
        return await window.ipcRenderer.invoke(RendererEvents.gitLog,RepoUtils.selectedRepo,filterOptions) as IPaginated<ICommitInfo>;
    }

    static isValidRepositoryPath(path:string){
        return window.ipcRenderer.sendSync(RendererEvents.isValidRepoPath, path) as boolean
    }
    static isValidPath(path:string){
        const r = IpcUtils.executeSync<boolean>(RendererEvents.isValidPath,[path]);
        return !!r.result;
    }
    
    static async removeRecentRepo(repoId:string){
        await window.ipcRenderer.invoke(RendererEvents.removeRecentRepo,repoId);
    }

    static rebaseBranch(branch:string){
        const options = [branch];
        return IpcUtils.runGitCommand(RendererEvents.rebase, [options]);
    }

    static async cherryPick(options:string[]){
        return IpcUtils.runGitCommand(RendererEvents.cherry_pick,[options])
    }

    private static execute<T=any>(channel:string,args:any[],disableErrorDisplay?:boolean):Promise<IpcResult<T>>{
        const result = {} as IpcResult<T>;
        return window.ipcRenderer.invoke(channel,...args).then(r=>{
            result.result = r;
            return result;
        }).catch((e)=>{
            let err = e?.toString() as string;
            err = IpcUtils.removeJSPartFromError(err);

            if(!disableErrorDisplay){
                IpcUtils.showError?.(err);
            }
            result.error = err;
            return result;
        });
    }

    private static executeSync<T=any>(channel:string,args:any[],disableErrorDisplay?:boolean){
        const result = {} as IpcResult<T>;
        try{
            const r:T = window.ipcRenderer.sendSync(channel,...args);
            result.result = r;
            return result;
        }catch(e:any){
            const err = e?.toString() as string;
            if(!disableErrorDisplay){
                IpcUtils.showError?.(err);
            }
            result.error = err;
            return result;
        };
    }

    private static async runGitCommand<TResult=any>(channel:string,args:any[],config?:{
        repositoryPath?:string|RepositoryInfo,
        preventErrorDisplay?:boolean,
    }){
        let repositoryPath = config?.repositoryPath;
        if(!repositoryPath)
            repositoryPath = RepoUtils.selectedRepo?.path;
        return IpcUtils.execute<TResult>(channel,[repositoryPath, ...args],config?.preventErrorDisplay);
    }

    static updateRepository(repo:RepositoryInfo){
        return IpcUtils.execute(RendererEvents.updateRepository,[repo]);
    }

    static showError:(err:string)=>void;

    static joinPath(...path:string[]){
        const r = this.executeSync<string>(RendererEvents.joinPath().channel,path);
        return r.result || "";
    }
    static async joinPathAsync(...path:string[]){
        const r = await this.execute<string>(RendererEvents.joinPathAsync,path);
        return r.result || "";
    }
    static async getAnnotations(repoId?:string){
        if(!repoId)
            repoId = RepoUtils.selectedRepo._id;
        const r = await this.execute<Annotation[]>(RendererEvents.annotations,[repoId]);
        return r;
    }

    static async addAnnotation(annots:Annotation[]){
        const r = await this.execute<any>(RendererEvents.addAnnotation,[annots]);
        return r;
    }

    static async deleteAnnotations(annots:Annotation[]){
        const r = await this.execute<any>(RendererEvents.removeAnnotation,[annots]);
        return r;
    }

    static async getRepoDetails(repoInfo:RepositoryInfo,filter:ICommitFilter){
        const r = await IpcUtils.runGitCommand<IRepositoryDetails>(RendererEvents.getRepositoryDetails().channel,[filter],{repositoryPath:repoInfo});
        return r;
    }

    static updateConfig(config:IConfigInfo){
        return IpcUtils.execute(RendererEvents.updateConfig,[config]);
    }

    static openLink(url:string){
        return IpcUtils.execute(RendererEvents.openLink,[url]);
    }

    static getNotifications(){
        return IpcUtils.execute<IUiNotification[]>(RendererEvents.loadNotifications,[]);
    }
    
}