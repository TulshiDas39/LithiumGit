import { v4 as uuid } from "uuid";
export interface BaseSchema{
    _id:string;
    createdAt:string;
    updateAt:string;
}

export function createBaseSchema(props?:Partial<BaseSchema>){
    let obj:BaseSchema={
        _id: uuid(),
        createdAt:new Date().toISOString(),
        updateAt:new Date().toISOString(),
    }
    if(props) obj = {...obj,...props};
    return obj;
}