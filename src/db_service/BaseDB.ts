import { BaseSchema ,createBaseSchema,StringUtils} from "common_library";

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
        this.dataStore.findOne({_id:id},callback)
    }

    getByIdAsync(id:string,callback: (err: Error, document: T) => void){
        return new Promise<T>((resolve,reject)=>{
            this.dataStore.findOne({_id:id},(err,doc)=>{
                if(err) reject(err);
                resolve(doc);
            });
        });
    }

    getByQuery(query:Partial<T>,callback: (err: Error, document: T) => void){
        this.dataStore.findOne(query,null,callback)
    }
    getManyByQuery(query:Partial<T>,callback: (err: Error, document: T[]) => void){
        this.dataStore.find(query,null,callback)
    }

    insertOne(record:T,cb?: (err: Error, document: T) => void){        
        this.dataStore.insert({
            ...createBaseSchema(),
            ...record
        },cb);
    }

    insertOneAsync(record:T){        
        return new Promise<T>((resolve,reject)=>{
            this.insertOne(record,(err,doc)=>{
                if(err) reject(err);
                resolve(doc);
            });            
        })       
    }

    insertOrUpdate(record:T,cb?:(err:Error,document:T)=>void){
        this.getById(record._id,(err,doc)=>{
            if(doc){
                doc.updateAt = new Date().toISOString();
                this.dataStore.update<T>({_id:record._id},record,{},(err,updateCount)=>{
                    if(cb){
                        if(err) cb(err,undefined);
                        else cb(undefined,record);
                    }
                });                    
            }
            else{                
                this.insertOne(record);
            }
            if(err) console.error(err);
        });
    }

    insertOrUpdateAsync(record:T,cb?:(err:Error,document:T)=>void){

        return new Promise<T>((resove,reject)=>{
            this.insertOrUpdate(record,(err,doc)=>{
                if(err) reject(err);
                resove(doc);
            });
        })        
    }
    
    insertMany(records:T[],cb?: (err: Error, documents: T[]) => void){
        if(records.length === 0) return;
        records.forEach(rec=>{
            if(!rec._id) rec._id = StringUtils.uuidv4();
            if(!rec.createdAt) rec.createdAt = new Date().toISOString();
            if(!rec.updateAt) rec.updateAt = new Date().toISOString();
        })
        this.dataStore.insert(records,cb);
    }

    insertManyAsync(records:T[]){
        return new Promise<T[]>((resolve,reject)=>{
            this.insertMany(records,(err,docs)=>{
                if(err) reject(err);
                resolve(docs);
            });
        })
    }

    updateOne(record:T,cb?: (err: Error, documentsCount: number) => void){
        this.getById(record._id,(err,doc)=>{
            if(doc) this.dataStore.update({_id:record._id}, record,{},cb);
            if(err) console.error(err);
        })
    }

    updateOneAsync(record:T){
        return new Promise<number>((resolve,reject)=>{
            this.updateOne(record,(err,updateCount)=>{
                if(err) reject(err);
                resolve(updateCount);
            })
        });        
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

    updateOrCreateManyAsync(records:T[]){
        return new Promise<number>((resolve,reject)=>{
            this.updateOrCreateMany(records,(err,updatecount)=>{
                if(err) reject(err);
                resolve(updatecount);
            })
        })
    }

    delete(query:Partial<T>,cb?: (err: Error, n: number) => void){        
        this.dataStore.remove(query,cb);
    }

    deleteAsync(query:Partial<T>){
        return new Promise<number>((resolve,reject)=>{
            this.delete(query,(err,deleteCount)=>{
                if(err) reject(err);
                resolve(deleteCount);
            })
        })
    }

}