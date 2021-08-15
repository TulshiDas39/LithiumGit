import { BaseSchema, createBaseSchema } from "./BaseSchema";

export interface RepositoryInfo extends BaseSchema{
    name:string ;
    path:string;
    isSelected:boolean;    
}

export const createRepositoryInfo=(props?:Partial<RepositoryInfo>)=>{
    let obj:RepositoryInfo={
        ...createBaseSchema(),
        isSelected:false,
        name:"",
        path:"",
    }
    if(props) obj = {...obj,...props};
    return obj;
}