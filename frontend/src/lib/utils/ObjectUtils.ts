import { ICommitInfo } from "common_library";
import { ICommitFlatInfo } from "../interfaces";

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
}