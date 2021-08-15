import { BaseSchema } from "common_library";

import * as DataStore from 'nedb';

export class BaseDB<T extends BaseSchema>{
    dataStore:DataStore<T>;
    constructor(dataFilePath:string){
        this.dataStore = new DataStore<T>({filename:dataFilePath,autoload:true});
    }

    getAll(){
        const all:T[] = this.dataStore.getAllData();
        return all;
    }

    getById(id:string,callback: (err: Error, document: T) => void){
        this.dataStore.findOne({_id:id},null,callback)
    }
    getByQuery(query:Partial<T>,callback: (err: Error, document: T) => void){
        this.dataStore.findOne(query,null,callback)
    }
    getManyByQuery(query:Partial<T>,callback: (err: Error, document: T[]) => void){
        this.dataStore.find(query,null,callback)
    }

    insertOne(record:T,cb?: (err: Error, document: T) => void){        
        this.dataStore.insert(record,cb);
    }
    
    insertMany(records:T[],cb?: (err: Error, documents: T[]) => void){ 

        this.dataStore.insert(records,cb);
    }
    updateOne(record:T,cb?: (err: Error, document: T) => void){        
        this.dataStore.update(record,cb);
    }
    updateOrCreateMany(records:T[],cb?: (err: Error, documentsCount: number) => void){
        records.forEach(record=>{
            this.dataStore.update<T>({_id:record._id},record,{upsert:true},cb);
        })
    }

    delete(query:Partial<T>,cb?: (err: Error, n: number) => void){        
        this.dataStore.remove(query,cb);
    }
}