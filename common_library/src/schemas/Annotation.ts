import { EnumAnnotationType } from "../enums";
import { BaseSchema, createBaseSchema } from "./BaseSchema";

export interface Annotation extends BaseSchema{
    value:string;
    repoId:string;
    type:EnumAnnotationType;
}


export const createAnnotation=(props?:Partial<Annotation>)=>{
    let obj:Annotation={
        ...createBaseSchema(),        
    } as Annotation;
    if(props) obj = {...obj,...props};
    return obj;
}