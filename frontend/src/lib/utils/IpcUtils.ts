import { ICommitInfo, ILogFilterOptions, IPaginated, IRemoteInfo, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import { BranchUtils } from "./BranchUtils";
import { IpcResult } from "../interfaces/IpcResult";

export class IpcUtils{
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
            repoInfo = BranchUtils.repositoryDetails.repoInfo;
        return window.ipcRenderer.invoke(RendererEvents.getStatus().channel,repoInfo);
    }

    static async getRepoStatusSync(repoInfo?:RepositoryInfo){
        if(!repoInfo)
            repoInfo = BranchUtils.repositoryDetails.repoInfo;
        const status:IStatus = await window.ipcRenderer.invoke(RendererEvents.getStatusSync().channel,repoInfo);
        return status;
    }

    static trigerPush(options?:string[]){
        if(!options){
            options = [BranchUtils.activeOriginName];
            if(!BranchUtils.repositoryDetails.status.trackingBranch)
                options.push("-u",BranchUtils.repositoryDetails.headCommit.ownerBranch.name);
        }
        return IpcUtils.runGitCommand(RendererEvents.push().channel,[options])        
    }

    static trigerPull(options?:string[]){
        if(!options){
            options = [BranchUtils.activeOriginName];
            if(!BranchUtils.repositoryDetails.status.trackingBranch)
                options.push(BranchUtils.repositoryDetails.headCommit.ownerBranch.name);
        }
        return IpcUtils.runGitCommand(RendererEvents.pull().channel,[options])        
    }

    static unstageItem(paths:string[],repoInfo:RepositoryInfo){
        return window.ipcRenderer.invoke(RendererEvents.unStageItem().channel,paths,repoInfo);
    }

    static stageItems(paths:string[], repoInfo:RepositoryInfo){
        return window.ipcRenderer.invoke(RendererEvents.stageItem().channel,paths,repoInfo);
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
        return window.ipcRenderer.invoke(RendererEvents.createBranch().channel, sourceCommit,BranchUtils.repositoryDetails,branchName,checkout);
    }

    static fetch(isAll:boolean){
        return window.ipcRenderer.invoke(RendererEvents.fetch().channel,BranchUtils.repositoryDetails,isAll);
    }

    static async getFileContent(path:string){
        return await window.ipcRenderer.invoke(RendererEvents.getFileContent().channel,path) as string[];
    }

    static async getDiff(options:string[]){
        return await window.ipcRenderer.invoke(RendererEvents.diff().channel,options,BranchUtils.repositoryDetails.repoInfo) as string;
    }

    static async getGitShowResult(options:string[]){
        return await window.ipcRenderer.invoke(RendererEvents.gitShow().channel,BranchUtils.repositoryDetails.repoInfo,options) as string;
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
        await window.ipcRenderer.invoke(RendererEvents.gitAddRemote().channel,BranchUtils.repositoryDetails.repoInfo,remote);
    }

    static async removeRemote(remoteName:string){
        await window.ipcRenderer.invoke(RendererEvents.gitRemoveRemote,BranchUtils.repositoryDetails.repoInfo,remoteName);
    }

    static async getRemoteList(){
        return await window.ipcRenderer.invoke(RendererEvents.gitGetRemoteList().channel,BranchUtils.repositoryDetails.repoInfo) as IRemoteInfo[];
    }

    static async getCommitList(filterOptions:ILogFilterOptions){
        return await window.ipcRenderer.invoke(RendererEvents.gitLog,BranchUtils.repositoryDetails.repoInfo,filterOptions) as IPaginated<ICommitInfo>;
    }

    static isValidPath(path:string){
        return window.ipcRenderer.sendSync(RendererEvents.isValidRepoPath, path) as boolean
    }
    
    static async removeRecentRepo(repoId:string){
        await window.ipcRenderer.invoke(RendererEvents.removeRecentRepo,repoId);
    }

    static async rebaseBranch(branch:string){
        await window.ipcRenderer.invoke(RendererEvents.rebase,BranchUtils.repositoryDetails.repoInfo,branch);
    }

    static async cherryPick(options:string[]){
        await window.ipcRenderer.invoke(RendererEvents.cherry_pick,BranchUtils.repositoryDetails.repoInfo,options);
    }

    private static execute<T=any>(channel:string,args:any[],disableErrorDisplay?:boolean):Promise<IpcResult<T>>{
        const result = {} as IpcResult<T>;
        return window.ipcRenderer.invoke(channel,...args).then(r=>{
            result.response = r;
            return result;
        }).catch((e)=>{
            const err = e?.toString() as string;
            if(!disableErrorDisplay){
                IpcUtils.showError?.(err);
                //ReduxStore?.dispatch(ActionModals.showModal(EnumModals.ERROR));
            }
            result.error = err;
            return result;
        });
    }

    private static async runGitCommand<TResult=any>(channel:string,args:any[],repositoryPath?:string){      
        if(!repositoryPath)
            repositoryPath = BranchUtils.repositoryDetails.repoInfo.path;
        return IpcUtils.execute<TResult>(channel,[repositoryPath, ...args]);
    }

    static updateRepository(repo:RepositoryInfo){
        return IpcUtils.execute(RendererEvents.updateRepository,[repo]);
    }

    static showError:(err:string)=>void;
}