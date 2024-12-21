import { createNotification, EnumNotificationType, IDownloadedVersion, INotification } from "common_library";
import { BaseDB } from "./BaseDB";
import { DBPath } from "./db_service";

export class NotificationDB extends BaseDB<INotification>{
    constructor(){
        super(DBPath.notification);
    }

    async addNotificationForNewUpdate(version:string){
        const data:IDownloadedVersion = {
            version,
        };
        const notification = createNotification<IDownloadedVersion>({
            type:EnumNotificationType.UpdateAvailable,
            action:{buttonText:"Install"},
            message:"Update available.",
        });
        notification.data = data;
        await this.deleteAsync({type:EnumNotificationType.UpdateAvailable});
        await this.insertOneAsync(notification);
        return notification;
    }
}