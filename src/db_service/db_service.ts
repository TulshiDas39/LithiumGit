import * as path from 'path';
import { AppData } from '../dataClasses';
import { ConfigDB } from './ConfigDB';
import { RepositoryDB } from './RepositoryDB';


export class DBPath{
    static rootFolderName = "db";
    static root = path.join(AppData.dataPath,DBPath.rootFolderName);
    static repository = path.join(AppData.dataPath,DBPath.rootFolderName,"repository.db");
    static config = path.join(AppData.dataPath,DBPath.rootFolderName,"config.db");
}

export class DB{
    static repository = new RepositoryDB();
    static config = new ConfigDB();
}