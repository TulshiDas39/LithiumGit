import { IStatus, RendererEvents } from "common_library";
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
}