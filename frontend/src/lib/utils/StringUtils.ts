import { EnumChangeType } from "common_library";

export class StringUtils{
    getLines(str:string){
        if(!str) return [];
        str = str.replace(/\n\r/g,"\n").replace(/\r/g,"\n");
        return str.split(/\n/g);
    }
    
    static getStatusText(type:EnumChangeType){
        if(type === EnumChangeType.CREATED)
            return "Added";
        if(type === EnumChangeType.MODIFIED)
            return "Modified";
        if(type === EnumChangeType.DELETED)
            return "Deleted";

        return "Conflicted";
    }
}