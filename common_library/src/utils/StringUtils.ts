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
        if(type === EnumChangeType.RENAMED)
            return "Renamed";

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

    private static getMatchScore(str:string,keys:string[]){
        
        const keyLen = keys.join().length;
        if(keyLen > str.length)
            return 0;
        let score = 0;
        let index = 0;
        let preIndex = 0;
        for(const key of keys){
            index = str.indexOf(key,preIndex);
            if(index < 0)
                return 0;
            const indexGap = index - preIndex + 1;
            score += key.length / indexGap;
            preIndex = index + key.length;
        }
        const extraLen = str.length - preIndex - 1;
        return score - (extraLen/str.length);
    }

    private static filterStrings(arr:string[],kes:string[][],limit:number){
        arr = arr.slice();
        const filteredList:{str:string;keys:string[],score:number}[] = [];
        for(let keyArr of kes){
            let scroring = arr.map(str => ({str,score:StringUtils.getMatchScore(str,keyArr),keys:keyArr})).filter(_=> _.score > 0);
            const strs = scroring.map(_=>_.str);
            arr = arr.filter(_=> !strs.includes(_));
            scroring.forEach(s => filteredList.push(s));
            if(filteredList.length >= limit){
                break;
            }
        }

        filteredList.sort((a,b) => a.score > b.score? -1:1);
        return filteredList.slice(0,limit);
    }

    static approxFilter(str:string[],input:string,limit:number){
        const splits = StringUtils.getAllSplits(input);
        const keys = splits.map(_=>_.splits);
        return StringUtils.filterStrings(str,keys,limit);
    }

    static GetFileExtension(pathOrName:string){
        const name = StringUtils.getFileName(pathOrName);
        const index = name.lastIndexOf(".");
        if(index < 0) return "";
        return name.slice(index);
    }

    private static getAllSplits(str:string) {
        const result:{splits:string[];score:number;}[] = [];

        const getScore = (arr:string[])=>{
            let score = 0;
            for(let i = 0; i < arr.length; i++){
                score += arr[i].length * (str.length - i);
            }
            return score;
        }
    
        const generateSplits = (current:string[], remaining:string) => {
            if (remaining.length === 0) {
                const score = getScore(current);
                result.push({splits:current,score});
                return;
            }
            
            for (let i = 1; i <= remaining.length; i++) {
                const prefix = remaining.slice(0, i);
                generateSplits([...current, prefix], remaining.slice(i));
            }
        };
    
        generateSplits([], str);
        result.sort((a,b)=> a.score > b.score?-1:1);
        return result;
    }
  
}