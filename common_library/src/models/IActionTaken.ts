import { EnumConflictSide } from "../enums";

export interface IActionTaken{
    conflictNo:number;
    taken:EnumConflictSide[];
}