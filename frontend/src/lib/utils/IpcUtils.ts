import { IStatus, RendererEvents, RepositoryInfo } from "common_library";
import { BranchUtils } from "./BranchUtils";

export class IpcUtils{
    static getRepoStatu(){
        return window.ipcRenderer.invoke(RendererEvents.getStatus().channel,BranchUtils.repositoryDetails.repoInfo).then((res:IStatus)=>{
            return res;
        });
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
}