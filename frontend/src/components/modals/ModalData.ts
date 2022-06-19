import { ICommitInfo } from "common_library"
import { IPositition } from "../../lib";

interface ICommitContextModalData{
    selectedCommit:ICommitInfo;
    position:IPositition;
}

interface ICreateBranchModal{
    sourceCommit:ICommitInfo;
}

export class InitialModalData{
    static readonly commitContextModal= {  } as ICommitContextModalData; 
    static readonly createBranchModal= {  } as ICreateBranchModal; 

}

export class ModalData{
    static commitContextModal = InitialModalData.commitContextModal;
    static createBranchModal = InitialModalData.createBranchModal;
}