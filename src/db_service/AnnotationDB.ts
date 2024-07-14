import { Annotation } from "common_library";
import { BaseDB } from "./BaseDB";
import { DBPath } from "./db_service";

export class AnnotationDB extends BaseDB<Annotation>{
    constructor(){
        super(DBPath.annotation);
    }

    GetByRepository(repoId:string){
        
    }
}