export interface ILine{
    text?:string;
    textHightlightIndex:{
        fromIndex:number;
        count:number;
    }[];
    hightLightBackground?:boolean;
    conflictNo?:number;
}