import { EnumConflictMarker, EnumConflictState } from "../enums";

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
    taken?:boolean;
}

export interface IConflictEditorLine extends ILine{
    conflictNo?:number;
    state?:EnumConflictState;
    marker?:EnumConflictMarker;
}

export interface ICEditorHiddenLine{
    conflictNo:number;
    afterLineIndex:number;
}