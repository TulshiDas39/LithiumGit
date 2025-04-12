import { createNotification, EnumNotificationType, INewVersionInfo, INotification } from "common_library";
import { BaseDB } from "./BaseDB";
import { DBPath } from "./db_service";

export class NotificationDB extends BaseDB<INotification>{
    constructor(){
        super(DBPath.notification);
    }

    async addNotificationForNewUpdate(data:INewVersionInfo){
        const existing:INotification<INewVersionInfo> = await this.findOneAsync({type:EnumNotificationType.UpdateAvailable});
        if(existing?.data?.version === data.version){
            return null;
        }        
        const notification = createNotification<INewVersionInfo>({
            type:EnumNotificationType.UpdateAvailable,
            action:{buttonText: data.downloaded? "Install":"Download"},
            message:"Update available.",
        });
        notification.data = data;
        await this.deleteAsync({type:EnumNotificationType.UpdateAvailable},true);
        await this.insertOneAsync(notification);
        return notification;
    }
}