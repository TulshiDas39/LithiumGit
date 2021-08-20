import { RepositoryInfo } from "common_library";
import { BaseDB } from "./BaseDB";
import * as path from 'path';
import { DBPath } from "./db_service";

export class RepositoryDB extends BaseDB<RepositoryInfo>{    
    constructor(){
        super(DBPath.repository);
    }
}