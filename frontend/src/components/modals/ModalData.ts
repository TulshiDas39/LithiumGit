import { ICommitInfo } from "common_library"
import { IPositition } from "../../lib";

interface ICommitContextModalData{
    selectedCommit:ICommitInfo;
    position:IPositition;
}

export class InitialModalData{
    static readonly commitContextModal= {        
    } as ICommitContextModalData; 
}

export class ModalData{
    static commitContextModal:ICommitContextModalData=InitialModalData.commitContextModal;
}