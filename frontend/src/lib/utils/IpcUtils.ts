import { RendererEvents, RepositoryInfo } from "common_library";
import { BranchUtils } from "./BranchUtils";

export class IpcUtils{
    static getRepoStatus(repoInfo?:RepositoryInfo){
        if(!repoInfo)
            repoInfo = BranchUtils.repositoryDetails.repoInfo;
        return window.ipcRenderer.invoke(RendererEvents.getStatus().channel,repoInfo);
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
}