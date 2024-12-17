import { INotification } from "common_library";
import { BaseDB } from "./BaseDB";
import { DBPath } from "./db_service";

export class NotificationDB extends BaseDB<INotification>{
    constructor(){
        super(DBPath.notification);
    }
}