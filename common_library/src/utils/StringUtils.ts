import { v4 as uuidv4 } from 'uuid';

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
}