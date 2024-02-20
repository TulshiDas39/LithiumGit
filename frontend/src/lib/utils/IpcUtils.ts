import { ICommitInfo, IRemoteInfo, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import { BranchUtils } from "./BranchUtils";

export class IpcUtils{
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

    static trigerPush(){
        return window.ipcRenderer.invoke(RendererEvents.push().channel,BranchUtils.repositoryDetails);
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

    static doCommit(message:string){
        return window.ipcRenderer.invoke(RendererEvents.commit().channel,BranchUtils.repositoryDetails.repoInfo,message);
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

    static async getGitShowResult(path:string){
        const options =  [`HEAD:${path}`];
        return await window.ipcRenderer.invoke(RendererEvents.gitShow().channel,BranchUtils.repositoryDetails.repoInfo,options) as string;
    }

    static async getGitShowResultOfStagedFile(path:string){
        const options = [":"+path];
        return await window.ipcRenderer.invoke(RendererEvents.gitShow().channel,BranchUtils.repositoryDetails.repoInfo,options) as string;
    }

    static async addRemote(remote:IRemoteInfo){
        await window.ipcRenderer.invoke(RendererEvents.gitAddRemote().channel,BranchUtils.repositoryDetails.repoInfo,remote);
    }

    static async getRemoteList(){
        return await window.ipcRenderer.invoke(RendererEvents.gitGetRemoteList().channel,BranchUtils.repositoryDetails.repoInfo) as IRemoteInfo[];
    }
    
}