export class StringUtils{
    static getFolderName(path:string){
        let sep = "/";
        if(path.indexOf("\\") != -1) sep = "\\";
        return path.split(sep).pop() || "";
    }
}