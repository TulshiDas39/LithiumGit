import { ConfigInfo } from "../dataClasses";
import { BaseDB } from "./BaseDB";
import { DBPath } from "./db_service";

export class ConfigDB extends BaseDB<ConfigInfo>{    
    constructor(){
        super(DBPath.config);
    }
}