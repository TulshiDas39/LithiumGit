import { RepositoryInfo } from "common_library";
import { BaseDB } from "./BaseDB";
import { DBPath } from "./db_service";

export class RepositoryDB extends BaseDB<RepositoryInfo>{    
    constructor(){
        super(DBPath.repository);
    }
}