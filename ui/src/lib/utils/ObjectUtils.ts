import { ICommitInfo, ITypedConfig } from "common_library";
import { ICommitFlatInfo, IScopedValue } from "../interfaces";

export class ObjectUtils{
    deepClone<T>(obj:T):T{
        return JSON.parse(JSON.stringify(obj));
    }

    mapToFlatObject(commit:ICommitInfo){
        const flatObj:ICommitFlatInfo = {
            author_email:commit.author_email,
            author_name:commit.author_name,
            avrebHash:commit.avrebHash,
            date:commit.date,
            hash:commit.hash,
            isHead:commit.isHead,
            message:commit.message,
            refs:commit.refs,
            refValues:commit.refValues,
        }
        return flatObj;
    }

    mapToScopedValue<T>(obj:ITypedConfig<T>){
        const res = {} as Record<keyof T, IScopedValue<any>>;
        const keys = Object.keys(obj.local);
        for(let key of keys){
            const tKey = key as keyof T;
            res[tKey] = {value: obj.local[tKey] || obj.global[tKey]} as IScopedValue<any>;
            res[tKey].isGlobal = res[tKey].value && !obj.local[tKey];
        }
        
        return res;
    }
}