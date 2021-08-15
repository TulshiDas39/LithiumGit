export interface BaseSchema{
    _id:string;
    createdAt:string;
    updateAt:string;
}

export function createBaseSchema(props?:Partial<BaseSchema>){
    let obj:BaseSchema={
        _id:"",
        createdAt:new Date().toDateString(),
        updateAt:new Date().toDateString(),
    }
    if(props) obj = {...obj,...props};
    return obj;
}