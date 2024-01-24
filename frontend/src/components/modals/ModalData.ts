import { ICommitInfo } from "common_library"
import { IPositition } from "../../lib";

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

export class InitialModalData{
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

}

export class ModalData{
    static commitContextModal = InitialModalData.commitContextModal;
    static createBranchModal = InitialModalData.createBranchModal;
    static errorModal = InitialModalData.errorModal;
    static confirmationModal = InitialModalData.confirmationModal;
}