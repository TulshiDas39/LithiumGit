import { createNotification, EnumNotificationType, INotification } from "common_library";
import { BaseDB } from "./BaseDB";
import { DBPath } from "./db_service";

export class NotificationDB extends BaseDB<INotification>{
    constructor(){
        super(DBPath.notification);
    }

    async addNotificationForNewUpdate(){
        const notification = createNotification({
            type:EnumNotificationType.UpdateAvailable,
            action:{buttonText:"Install"},
            message:"Update available."
        });
        await this.deleteAsync({type:EnumNotificationType.UpdateAvailable});
        await this.insertOneAsync(notification);
        return notification;
    }
}