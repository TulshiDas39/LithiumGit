export interface ICommitFilter{
    fromDate?:string;
    toDate?:string;
    baseDate?:string;
    limit:number;
    userModified:boolean;
}