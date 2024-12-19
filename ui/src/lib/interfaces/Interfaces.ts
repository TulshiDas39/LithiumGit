import { INotification } from "common_library";

export interface IUiNotification extends INotification{
    isActive?:boolean;
}