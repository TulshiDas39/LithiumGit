import { Annotation, IActionTaken, ICommitInfo, ILogFilterOptions, IPaginated, IRemoteInfo, IStash, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import { RepoUtils } from "./RepoUtils";
import { IpcResult } from "../interfaces/IpcResult";

export class IpcUtils{
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
        const fullPath = await this.joinPathAsync(RepoUtils.repositoryDetails.repoInfo.path,path);
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
            repoInfo = RepoUtils.repositoryDetails.repoInfo;
        return window.ipcRenderer.invoke(RendererEvents.getStatus().channel,repoInfo) as Promise<IStatus>;
    }

    static async getRepoStatusSync(repoInfo?:RepositoryInfo){
        if(!repoInfo)
            repoInfo = RepoUtils.repositoryDetails.repoInfo;
        const status:IStatus = await window.ipcRenderer.invoke(RendererEvents.getStatusSync().channel,repoInfo);
        return status;
    }

    static trigerPush(options?:string[]){
        if(!options){
            options = [RepoUtils.activeOriginName];
            if(!RepoUtils.repositoryDetails.status.trackingBranch)
                options.push("-u",RepoUtils.repositoryDetails.headCommit.ownerBranch.name);
        }
        return IpcUtils.runGitCommand(RendererEvents.push().channel,[options])        
    }

    static trigerPull(options?:string[]){
        if(!options){
            options = [RepoUtils.activeOriginName];
            if(!RepoUtils.repositoryDetails.status.trackingBranch)
                options.push(RepoUtils.repositoryDetails.headCommit.ownerBranch.name);
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
        return await window.ipcRenderer.invoke(RendererEvents.diff().channel,options,RepoUtils.repositoryDetails.repoInfo) as string;
    }

    static async getGitShowResult(options:string[]){
        return await window.ipcRenderer.invoke(RendererEvents.gitShow().channel,RepoUtils.repositoryDetails.repoInfo,options) as string;
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
        await window.ipcRenderer.invoke(RendererEvents.gitAddRemote().channel,RepoUtils.repositoryDetails.repoInfo,remote);
    }

    static async removeRemote(remoteName:string){
        await window.ipcRenderer.invoke(RendererEvents.gitRemoveRemote,RepoUtils.repositoryDetails.repoInfo,remoteName);
    }

    static async getRemoteList(){
        return await window.ipcRenderer.invoke(RendererEvents.gitGetRemoteList().channel,RepoUtils.repositoryDetails.repoInfo) as IRemoteInfo[];
    }

    static async getCommitList(filterOptions:ILogFilterOptions){
        return await window.ipcRenderer.invoke(RendererEvents.gitLog,RepoUtils.repositoryDetails.repoInfo,filterOptions) as IPaginated<ICommitInfo>;
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

    static async rebaseBranch(branch:string){
        await window.ipcRenderer.invoke(RendererEvents.rebase,RepoUtils.repositoryDetails.repoInfo,branch);
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

    private static async runGitCommand<TResult=any>(channel:string,args:any[],repositoryPath?:string){      
        if(!repositoryPath)
            repositoryPath = RepoUtils.repositoryDetails.repoInfo.path;
        return IpcUtils.execute<TResult>(channel,[repositoryPath, ...args]);
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
            repoId = RepoUtils.repositoryDetails.repoInfo._id;
        const r = await this.execute<Annotation[]>(RendererEvents.annotations,[repoId]);
        return r;
    }

    static async addAnnotation(annot:Annotation){
        const r = await this.execute<any>(RendererEvents.addAnnotation,[annot]);
        return r;
    }
}