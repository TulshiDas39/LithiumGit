import { ICommitInfo } from "common_library"

interface ICommitContextModalData{
    selectedCommit:ICommitInfo;
}

export class InitialModalData{
    static readonly commitContextModal:ICommitContextModalData= {
        selectedCommit: null!
    };
}

export class ModalData{
    static commitContextModal:ICommitContextModalData=InitialModalData.commitContextModal;
}