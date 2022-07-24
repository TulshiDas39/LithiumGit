export class StringUtils{
    getLines(str:string){
        if(!str) return [];
        str = str.replace(/\n\r/g,"\n").replace(/\r/g,"\n");
        return str.split(/\n/g);
    }
    
}