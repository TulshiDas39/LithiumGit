import { IConfigInfo } from "common_library";
import { BaseDB } from "./BaseDB";
import { DBPath } from "./db_service";

export class ConfigDB extends BaseDB<IConfigInfo>{    
    constructor(){
        super(DBPath.config);
    }

    async insertAndRemainOneAsync(record:IConfigInfo){
        await this.deleteAsync({});
        const newRecord = await this.insertOneAsync(record);
        return newRecord;
    }
}