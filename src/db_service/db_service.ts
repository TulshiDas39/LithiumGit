import * as path from 'path';
import { AppData } from '../dataClasses';
import { ConfigDB } from './ConfigDB';
import { RepositoryDB } from './RepositoryDB';
import { AnnotationDB } from './AnnotationDB';
import { NotificationDB } from './NotificationDB';


export class DBPath{
    static rootFolderName = "db";
    static root(){
        return path.join(AppData.dataPath,DBPath.rootFolderName);
    }
    static repository(){
        return path.join(AppData.dataPath,DBPath.rootFolderName,"repository.db");
    }    
    static config(){
        return path.join(AppData.dataPath,DBPath.rootFolderName,"config.db");
    }
    static annotation(){
        return path.join(AppData.dataPath,DBPath.rootFolderName,"annotation.db");
    }
    static notification(){
        return path.join(AppData.dataPath,DBPath.rootFolderName,"notification.db");
    }
}

export class DB{
    static repository:RepositoryDB = null!;
    static config:ConfigDB = null!;
    static annotation:AnnotationDB = null!;
    static notification:NotificationDB = null!;

    static async load(){
        DB.repository = new RepositoryDB();        
        DB.config = new ConfigDB();
        DB.annotation = new AnnotationDB();
        DB.notification = new NotificationDB();

        await DB.repository.load();
        await DB.config.load();
        await DB.annotation.load();
        await DB.notification.load();
    }
}