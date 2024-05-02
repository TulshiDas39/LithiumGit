export interface ICommitFlatInfo{
    hash:string;
    avrebHash:string;    
    date:string;
    message:string;
    refs:string;
    refValues:string[]
    author_name:string;
    author_email:string;    
    isHead:boolean;    
}