import { connection } from "../idb_service";

export class BaseService<T> {
    private name:string="";
    constructor(name:string){
        this.name = name;
    }

    async insertOne(record:T){
        await connection.insert<T>({
            into: this.name,
            values: [record]
        });        
        return record;
    }

    async insertMany(records:T[]){
        await connection.insert<T>({
            into: this.name,
            values: records
        });        
        return records;
    }
}