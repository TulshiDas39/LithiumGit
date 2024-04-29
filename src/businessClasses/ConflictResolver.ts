import { IActionTaken, EnumConflictSide } from 'common_library';
import * as fs from 'fs';
import { FileManager } from './FileManager';

export class ConflictResolver{

    private readonly currentMarker = "<<<<<<< HEAD";
    private readonly endingMarker = ">>>>>>>";
    private readonly separator = "=======";

    async resolveConflict(path: string, actions: IActionTaken[]) {
        const lines = await this.getLines(path);
        let actionIndex = 0;
        for(let i=0;i<lines.length;i++){
            let line = lines[i];
            if(line.startsWith(this.currentMarker)){
                const action = actions[actionIndex];
                lines.splice(i,1);
                line = lines[i];
                const currentChanges:string[] = [];
                const incomingChanges:string[] = [];
            
                while(!this.isSeparator(line)){
                    lines.splice(i,1);
                    currentChanges.push(line);
                    line = lines[i];
                }
                lines.splice(i,1);
                line = lines[i];

                while(!line.startsWith(this.endingMarker)){
                    lines.splice(i,1);
                    incomingChanges.push(line);
                    line = lines[i];
                }
                lines.splice(i,1);                

                for(let item of action.taken){
                    if(item ===  EnumConflictSide.Current){
                        currentChanges.forEach(l => {
                            lines.splice(i,0,l);
                            i++;
                        });
                    }
                    else{
                        incomingChanges.forEach(l=> {
                            lines.splice(i,0,l);
                            i++;
                        });
                    }
                }
                i--;
                actionIndex++;
            }
        }
        const content = lines.join("\n");
        await new FileManager().writeToFile(path,content);
    }

    private isSeparator(line:string) {
        if(line.endsWith('\r')){
            line = line.substring(0,line.length - 1);
        }
        return line === this.separator;
    }

    private getLines(path: string){
        return new Promise<string[]>((res)=>{
            fs.readFile(path,{encoding:"utf8"},(err,data) => {
                if(!err){
                    const lines = data.split(/\n/g);
                    res(lines);
                }
                else{
                    res([]);
                }
            })
        })
    }
}