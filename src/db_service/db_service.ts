import * as path from 'path';
import { AppData } from '../dataClasses';
import { RepositoryDB } from './RepositoryDB';


export class DBPath{
    static rootFolderName = "db";
    static root = path.join(AppData.appPath,DBPath.rootFolderName);
    static repository = path.join(AppData.appPath,DBPath.rootFolderName,"repository.db");
}

export class DB{
    static repository = new RepositoryDB();
}