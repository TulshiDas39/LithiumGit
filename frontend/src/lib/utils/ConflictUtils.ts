import { IFile } from "common_library";
import { ILine } from "../interfaces";

export class ConflictUtils{
    static containerId = "";
    static file?:IFile;
    static currentLines:ILine[];
    static previousLines:ILine[];
    private static heighlightedLineIndexes:number[]=[];
    
    static GetUiLinesOfConflict(contentLines: string[]) {
        const currentMarker = "<<<<<<< HEAD";
        const endingMarker = ">>>>>>>";
        const separator = "=======";
    
        const currentLines:ILine[] = [];
        const previousLines:ILine[] = [];
        let conflictNo = 0;
        let currentChangeDetected = false;
        let incomingChangeDetected = false;
        for(const contentLine of contentLines){
            if(contentLine === currentMarker){
                conflictNo++;
                currentChangeDetected = true;
                incomingChangeDetected = false;
                continue;
            }
            if(contentLine === separator){
                currentChangeDetected = false;
                incomingChangeDetected = true;
                continue;
            }
            if(contentLine.startsWith(endingMarker)){
                currentChangeDetected = false;
                incomingChangeDetected = false;
                while(currentLines.length > previousLines.length){
                    previousLines.push({textHightlightIndex:[]});
                }
                while(currentLines.length < previousLines.length){
                    currentLines.push({textHightlightIndex:[]});
                }                
                continue;
            }
            if(currentChangeDetected){
                currentLines.push({
                    text:contentLine,
                    hightLightBackground:true,
                    textHightlightIndex:[],
                    conflictNo
                });
                continue;
            }
            if(incomingChangeDetected){
                previousLines.push({
                    text:contentLine,
                    hightLightBackground:true,
                    textHightlightIndex:[],
                    conflictNo
                });
                continue;
            }
            previousLines.push({
                text:contentLine,
                textHightlightIndex:[],
            })
            currentLines.push({
                text:contentLine,
                textHightlightIndex:[],
            })            
        }
        return {currentLines,previousLines};
    }
}