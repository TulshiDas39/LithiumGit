import { BaseSchema } from "./BaseSchema";

export class RepositoryInfo extends BaseSchema{
    name = "";
    path="";
    isSelected = false;
    constructor(path:string,name:string,isSelected:boolean=false){
        super();
        this.path = path;
        this.name = name;
        this.isSelected = isSelected;
    }
}