import { BaseSchema ,StringUtils} from "common_library";

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
        if(records.length === 0) return;
        records.forEach(rec=>{
            rec._id = StringUtils.uuidv4();
            rec.createdAt = new Date().toISOString();
            rec.updateAt = new Date().toISOString();
        })
        this.dataStore.insert(records,cb);
    }
    updateOne(record:T,cb?: (err: Error, documentsCount: number) => void){
        this.getById(record._id,(err,doc)=>{
            if(doc) this.dataStore.update({_id:record._id}, record,{},cb);
            if(err) console.error(err);
        })
    }
    updateOrCreateMany(records:T[],cb?: (err: Error, documentsCount: number) => void){
        if(records.length === 0) return ;
        let iteration=0;
        let newRecords:T[]=[];
        records.forEach(record=>{
            this.getById(record._id,(err,doc)=>{
                iteration++;
                if(doc){
                    doc.updateAt = new Date().toISOString();
                    this.dataStore.update<T>({_id:record._id},record,{},cb);                    
                }
                else{
                    newRecords.push(record);
                    if(iteration == records.length) this.insertMany(newRecords);
                }
                if(err) console.error(err);
            });
            
        })
    }

    delete(query:Partial<T>,cb?: (err: Error, n: number) => void){        
        this.dataStore.remove(query,cb);
    }
}