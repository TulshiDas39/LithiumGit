import * as path from 'path';
import { RepositoryDB } from './RepositoryDB';
export class DBPath{
    static rootFolderName = "db";
    static root = path.join(__dirname,DBPath.rootFolderName);
    static repository = path.join(__dirname,DBPath.rootFolderName,"repository");
}

export class DB{
    static repository = new RepositoryDB();
}