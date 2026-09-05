import { IActionTaken, EnumConflictSide, EnumLinefeed } from 'common_library';
import * as fs from 'fs';
import { FileManager } from './FileManager';

export class ConflictResolver{

    private readonly currentMarker = "<<<<<<<";
    private readonly endingMarker = ">>>>>>>";
    private readonly separator = "=======";

    async resolveConflict(path: string, actions: IActionTaken[]) {
        const { lines, lineFeedType,encoding } = await this.getLines(path);
        if(actions.length === 1 && actions[0].conflictNo === -1){
            if(actions[0].taken[0] === EnumConflictSide.Incoming){
                this.acceptAllIncomingChanges(lines);
            }
            else{
                this.acceptAllCurrentChanges(lines);
            }
        }
        else{
            this.updateLines(actions,lines);
        }
        const content = lines.join(lineFeedType);
        await new FileManager().replaceFileContent(path,content,encoding);
    }

    private acceptAllIncomingChanges(lines: string[]) {
        for(let i=0;i<lines.length;i++){
            let line = lines[i];
            if(line.startsWith(this.currentMarker)){
                lines.splice(i,1);
                line = lines[i];
            
                while(!this.isSeparator(line)){
                    lines.splice(i,1);
                    line = lines[i];
                }
                lines.splice(i,1);
                line = lines[i];

                while(!line.startsWith(this.endingMarker)){
                    i++
                    line = lines[i];
                }
                lines.splice(i,1);
                i--;
            }
        }
    }

    private acceptAllCurrentChanges(lines: string[]) {
        for(let i=0;i<lines.length;i++){
            let line = lines[i];
            if(line.startsWith(this.currentMarker)){
                lines.splice(i,1);
                line = lines[i];
            
                while(!this.isSeparator(line)){                    
                    i++;                    
                    line = lines[i];
                }
                lines.splice(i,1);
                line = lines[i];

                while(!line.startsWith(this.endingMarker)){
                    lines.splice(i,1);                    
                    line = lines[i];
                }
                lines.splice(i,1);                
                i--;
            }
        }
    }

    private updateLines(actions:IActionTaken[], lines:string[]){
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
    }

    private isSeparator(line:string) {
        if(line.endsWith('\r')){
            line = line.substring(0,line.length - 1);
        }
        return line === this.separator;
    }

    private async getLines(path: string){
        const fm = new FileManager();
        const encoding = await fm.detectFileEncoding(path);
        const content = await fm.getFileContentRaw(path,encoding);        

        const parts = content.split(/(\r\n|\r|\n)/) || [];
        let lfCount = 0;
        let crlfCount = 0;
        const lines:string[] = [];
        for(let i=0;i<parts.length;i=i+2){
            lines.push(parts[i]);
            if(parts[i+1] === "\r\n"){
                crlfCount++;
            }else if(parts[i+1] === "\n"){
                lfCount++;
            }
        }

        let lineFeedType = EnumLinefeed.CRLF;

        if(!!lfCount || !!crlfCount){
            lineFeedType = crlfCount > lfCount ? EnumLinefeed.CRLF : EnumLinefeed.LF;
        }

        return {lines, lineFeedType,encoding};
    }
}