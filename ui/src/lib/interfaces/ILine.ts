export interface ILine{
    text?:string;
    textHightlightIndex:{
        fromIndex:number;
        count:number;
    }[];
    hightLightBackground?:boolean;
    conflictNo?:number;
}

export interface IUnifiedLine{
    side:"added"|"removed"|"context";
    text?:string;
    textHightlightIndex:{
        fromIndex:number;
        count:number;
    }[];
    hightLightBackground?:boolean;
    oldLineNo?:number;
    newLineNo?:number;
}