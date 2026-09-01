import { EnumConflictState } from "../enums";

export interface ILine{
    text?:string;
    textHightlightIndex:{
        fromIndex:number;
        count:number;
    }[];
    hightLightBackground?:boolean;
}


export interface IConflictLine extends ILine{
    conflictNo?:number;    
    taken?:EnumConflictState;
}