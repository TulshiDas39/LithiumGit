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

export class InitialModalData{
    static readonly commitContextModal= {  } as ICommitContextModalData; 
    static get createBranchModal() {
        return {} as ICreateBranchModal;
    };
    static get errorModal(){
        return {} as IErrorModalData;
    }

}

export class ModalData{
    static commitContextModal = InitialModalData.commitContextModal;
    static createBranchModal = InitialModalData.createBranchModal;
    static errorModal = InitialModalData.errorModal;
}