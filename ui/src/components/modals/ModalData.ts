import { ICommitInfo } from "common_library"
import { IContextItem, IPositition } from "../../lib";

interface IContextModalData{
    items:IContextItem[];
    position:IPositition;
}

interface ICommitContextModalData{
    selectedCommit:ICommitInfo;
    position:IPositition;
}

interface ICreateBranchModal{
    sourceCommit:ICommitInfo;
}

interface IErrorModalData{
    message:string;
}

interface IConfirmationModalData{
    message:string;
    YesHandler:()=>void;
    NoHandler:()=>void;
}

export interface IToastData{
    title?: string;
    message: string;
    customClass?: string;
}

export class InitialModalData{
    static get contextModal(){
        return { items:[],position:{x:0,y:0} } as IContextModalData;
    } 
    static readonly commitContextModal= {  } as ICommitContextModalData; 
    static get createBranchModal() {
        return {} as ICreateBranchModal;
    };
    static get errorModal(){
        return {} as IErrorModalData;
    }

    static get confirmationModal(){
        return {
            YesHandler:()=>{},
            NoHandler:()=>{}
        } as IConfirmationModalData;
    }

    static get appToast(){
        return {
        message: "Successful",
        customClass: "bg-success",
    } as IToastData;
    
}

}

export class ModalData{
    static commitContextModal = InitialModalData.commitContextModal;
    static contextModal = InitialModalData.contextModal;
    static createBranchModal = InitialModalData.createBranchModal;
    static errorModal = InitialModalData.errorModal;
    static confirmationModal = InitialModalData.confirmationModal;
    static appToast = InitialModalData.appToast;
}