import { v4 as uuidv4 } from 'uuid';
import { EnumChangeType } from '../enums';

export class StringUtils{
    static getFolderName(path:string){
        let sep = "/";
        if(path.indexOf("\\") != -1) sep = "\\";
        return path.split(sep).pop() || "";
    }

    static uuidv4() {
        return uuidv4();
    }
    static getWords(str:string){
        return str.split(/(\s+)/).filter( e => e.trim().length > 0);
    }

    static getFileName(path:string){
        if(!path)
            return "";
        const splits = path.split(/[/\\]/g);
        if(!splits.length)
            return "";
        return splits[splits.length-1];
    }

    static getLines(str:string){
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

    static getChangeType(str:string){
        if(str === "M")
            return EnumChangeType.MODIFIED;
        if(str === "A")
            return EnumChangeType.CREATED;
        if(str === "D")
            return EnumChangeType.DELETED;
        if(str === "C")
            return EnumChangeType.CONFLICTED;

        return EnumChangeType.MODIFIED;
    }

    static getChangeTypeHint(type:EnumChangeType){
        if(type === EnumChangeType.CONFLICTED)
            return "C";
        if(type === EnumChangeType.CREATED)
            return "A";
        if(type === EnumChangeType.DELETED)
            return "D";
        if(type === EnumChangeType.MODIFIED)
            return "M";
    }
}