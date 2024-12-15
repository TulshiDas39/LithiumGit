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


    static getSimilarityRecurse(str:string,input:string,strIndex=0,inputIndex=0):{index:number;count:number}[]{
        const index = str.indexOf(input[inputIndex],strIndex);        
        if(index < 0)
            return [];

        if(inputIndex === input.length - 1){
            const indexes:{index:number;count:number}[]=[{index,count:1}];
            return indexes;
        }
        else{
            let indexes = this.getSimilarityRecurse(str,input,index+1,inputIndex+1);
            if(!indexes.length)
                return [];

            const first = indexes[0];
            if(first.index === index + 1){
                first.index = index;
                first.count += 1;
            }else{
                indexes = [{index,count:1}, ...indexes];
            }

            return indexes;
        }
        
    }

    static getSimilarity(str:string,input:string){
        if(input.length > str.length)
            return 0;
        if(input.length === str.length){
            if(input === str)
                return 1;
            return 0;
        }

        const allInputSplits = StringUtils.getAllSplits(input);
        let strIndex = 0;
        let inputIndex = 0;
        const allSimilarities: {index: number;count: number;}[][]=[];
        do{
            const similarities = this.getSimilarityRecurse(str,input,strIndex,inputIndex);
            if(!similarities.length)
                break;
            allSimilarities.push(similarities);
            const first = similarities[0];
            if(str.length - first.index -1 < input.length)
                break;
            
            strIndex = first.index + 1;
            inputIndex = 0;
        }while(true);

        // let i=0;
        // const ind = str.indexOf(input[0]);
        // if(ind < 0)
        //     return similarities;

        
        // while( i < input.length){
        //     const similars:{index:number;count:number}[]=[];
        //     let j = i;
        //     while( j < input.length ){
        //         let scount = 0;
        //         let index = j;
        //         for(let k = j; k < str.length && j < input.length;k++ ){
        //             if(str[k] == input[j]){
        //                 j++;
        //                 scount++;                        
        //             }
        //             else if(scount){
        //                 similars.push({index,count:scount});
        //                 scount = 0;
        //                 index=j;
        //             }
        //         }
        //         if(scount){
        //             similars.push({index,count:scount});
        //         }                
        //     }
        //     similarities.push(similars);

        // }

        console.log(allSimilarities);
    }

    static getAllSplits(str:string) {
        const result:string[][] = [];
    
        const generateSplits = (current:string[], remaining:string) => {
            if (remaining.length === 0) {
                result.push(current);
                return;
            }
            
            for (let i = 1; i <= remaining.length; i++) {
                const prefix = remaining.slice(0, i);
                generateSplits([...current, prefix], remaining.slice(i));
            }
        };
    
        generateSplits([], str);
        return result;
  }
  
  // Example usage
//   const str = "abc";
//   const splits = getAllSplits(str);
//   console.log(splits);
  
}