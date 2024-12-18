import { EnumNotificationType } from "../enums";
import { INotificationAction } from "../models/INotificationAction";
import { BaseSchema, createBaseSchema } from "./BaseSchema";

export interface INotification extends BaseSchema{
    message:string;
    action?:INotificationAction;
    type:EnumNotificationType;
    isRead:boolean;
}

export const createNotification=(props?:Partial<INotification>)=>{
    let obj:INotification={
        ...createBaseSchema(),        
    } as INotification;
    if(props) obj = {...obj,...props};
    return obj;
}

export const createNotificationForNewUpdate=()=>{
    return createNotification({
        type:EnumNotificationType.UpdateAvailable,
        action:{buttonText:"Install"},
        message:"Update available."
    })
}