import { IBranchDetails, IBranchRemote } from ".";

export interface ICommitInfo{
    hash:string;
    avrebHash:string;
    branchesFromThis:IBranchDetails[];
    parentHashes:string[];  
    ownerBranch:IBranchDetails;
    branchNameWithRemotes:IBranchRemote[] ;
    nextCommit:ICommitInfo;
    previousCommit:ICommitInfo ;
    date:string;
    message:string;
    refs:string;
    refValues:string[]
    body:string;
    author_name:string;
    author_email:string;
    x:number;
    isHead:boolean;
    inMergingState?:boolean;
    // SingleCommit UiObj;
}

export function CreateCommitInfoObj(){
    const obj:ICommitInfo = {
        branchesFromThis:[],
        branchNameWithRemotes:[],
        parentHashes:[],
        author_email:"",
        author_name:"",
        avrebHash:"",
        body:"",
        date:"",
        hash:"",
        message:"",
        refs:"",
        x:0,
        nextCommit:null!,
        ownerBranch:null!,
        previousCommit:null!,
        isHead:false,
        refValues:[],
    }
    return obj;
}