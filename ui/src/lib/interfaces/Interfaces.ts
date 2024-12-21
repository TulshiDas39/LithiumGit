import { INotification } from "common_library";

export interface IUiNotification extends INotification{
    isActive?:boolean;
}

export interface IContextItem{
    text:string;
    onClick:()=>void;
    icon?:JSX.Element;
}