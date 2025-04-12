import { EnumNotificationType } from "../enums";
import { INotificationAction } from "../models/INotificationAction";
import { BaseSchema, createBaseSchema } from "./BaseSchema";

export interface INotification<T=any> extends BaseSchema{
    message:string;
    action?:INotificationAction;
    type:EnumNotificationType;
    isRead:boolean;
    data?:T
}

export const createNotification=<T=any>(props?:Partial<INotification<T>>)=>{
    let obj={
        ...createBaseSchema(),        
    } as INotification<T>;
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