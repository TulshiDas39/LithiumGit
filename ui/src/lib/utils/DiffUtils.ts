import { ILine } from "../interfaces";
import { EnumCustomBlots } from "../enums";
import { IpcUtils } from "./IpcUtils";
export type TDiffLineType = "unchanged"|"added"|"removed";

export class DiffUtils{

    static tabSize = 4;

    static getEditorWidth (lines:string[]){
        const width = Math.max(...lines.map(l=>{
            let length = l.length;
            if(l.includes('\t')) {
                let tabCount = l.match(/\t/g)?.length ?? 0;
                length += tabCount * (this.tabSize) - tabCount;
            }
            return length;
        }),0);
        return width+20;
    }

    static GetUiLines(diff:string,textLines:string[]){
        
        diff = diff.replace(/\n\r/g,"\n").replace(/\r/g,"\n");
        const diffLines = diff.split(/\n/g).filter(x=> !!x);
        let startIndexesOfSections = 0;
        let lineNumberOfCurrentChange= 0;
        let lineNumberOfPreviousChange= 0;
        
        const getFileLineNumber=(line:string)=>{
            const diffRange = line.split('@@')[1].trim();
            const previousRange = diffRange.split('+')[0].trim();
            const currentRange = diffRange.split('+')[1].trim();
            
            const lineNumberOfPreviousChange = Number(previousRange.split(',')[0].substring(1))
            const lineNumberOfCurrentChange = Number(currentRange.split(',')[0])
            return {
                lineNumberOfPreviousChange,
                lineNumberOfCurrentChange,
            }
        }

        for(let i=0;i<diffLines.length; i++){
            const line = diffLines[i];
            if(line.startsWith("@@")) {
                startIndexesOfSections=i;
                const lineNumber = getFileLineNumber(line);
                lineNumberOfCurrentChange = lineNumber.lineNumberOfCurrentChange;
                lineNumberOfPreviousChange = lineNumber.lineNumberOfPreviousChange;
                break;
            }
        }

        // No hunks found (no changes)
        if(lineNumberOfCurrentChange === 0){
            const lines:ILine[] = textLines.map(text=>({ text, textHightlightIndex:[] }));
            return { currentLines: lines, previousLines: [...lines] };
        }

        let currentLines:ILine[]=[];
        let previousLines:ILine[]=[];

        // Fill lines before the first hunk
        for(let i=0;i<lineNumberOfCurrentChange-1;i++){
            const line:ILine={ text:textLines[i], textHightlightIndex:[] };
            currentLines.push(line);
            previousLines.push(line);
        }

        // Character-level diff: highlight the changed middle section between common prefix/suffix
        const computeCharDiff=(oldStr:string, newStr:string)=>{
            let start = 0;
            while(start < oldStr.length && start < newStr.length && oldStr[start] === newStr[start])
                start++;
            let oldEnd = oldStr.length - 1;
            let newEnd = newStr.length - 1;
            while(oldEnd >= start && newEnd >= start && oldStr[oldEnd] === newStr[newEnd]){
                oldEnd--;
                newEnd--;
            }
            const prevHighlights = oldEnd >= start ? [{ fromIndex:start, count:oldEnd-start+1 }] : [];
            const currHighlights = newEnd >= start ? [{ fromIndex:start, count:newEnd-start+1 }] : [];
            return { prevHighlights, currHighlights };
        };

        let removedBuffer:string[] = [];
        let addedBuffer:string[] = [];

        const flushBuffers=()=>{
            const maxLen = Math.max(removedBuffer.length, addedBuffer.length);
            for(let i=0;i<maxLen;i++){
                const hasOld = i < removedBuffer.length;
                const hasNew = i < addedBuffer.length;
                if(hasOld && hasNew){
                    const { prevHighlights, currHighlights } = computeCharDiff(removedBuffer[i], addedBuffer[i]);
                    previousLines.push({
                        text: removedBuffer[i],
                        textHightlightIndex: prevHighlights,
                        hightLightBackground: prevHighlights.length > 0,
                    });
                    currentLines.push({
                        text: addedBuffer[i],
                        textHightlightIndex: currHighlights,
                        hightLightBackground: currHighlights.length > 0,
                    });
                } else if(hasOld){
                    previousLines.push({ text:removedBuffer[i], textHightlightIndex:[], hightLightBackground:true });
                    currentLines.push({ textHightlightIndex:[] });
                } else {
                    currentLines.push({ text:addedBuffer[i], textHightlightIndex:[], hightLightBackground:true });
                    previousLines.push({ textHightlightIndex:[] });
                }
            }
            removedBuffer = [];
            addedBuffer = [];
        };

        for(let i=startIndexesOfSections;i<diffLines.length;i++){
            const diffLine = diffLines[i];

            if(diffLine.startsWith("@@")){
                flushBuffers();
                const nextLineNumbers = getFileLineNumber(diffLine);
                // Fill unchanged gap between hunks
                for(let j=lineNumberOfCurrentChange-1;j<nextLineNumbers.lineNumberOfCurrentChange-1;j++){
                    const line:ILine={ text:textLines[j], textHightlightIndex:[] };
                    currentLines.push(line);
                    previousLines.push(line);
                }
                lineNumberOfCurrentChange = nextLineNumbers.lineNumberOfCurrentChange;
                lineNumberOfPreviousChange = nextLineNumbers.lineNumberOfPreviousChange;
            }
            else if(diffLine.startsWith(" ")){
                flushBuffers();
                const text = diffLine.substring(1);
                const line:ILine={ text, textHightlightIndex:[] };
                currentLines.push(line);
                previousLines.push(line);
                lineNumberOfCurrentChange++;
                lineNumberOfPreviousChange++;
            }
            else if(diffLine.startsWith("-")){
                if(addedBuffer.length > 0) flushBuffers();
                removedBuffer.push(diffLine.substring(1));
                lineNumberOfPreviousChange++;
            }
            else if(diffLine.startsWith("+")){
                addedBuffer.push(diffLine.substring(1));
                lineNumberOfCurrentChange++;
            }
            // Other lines (diff --git, index, etc.) are ignored
        }

        flushBuffers();

        // Fill remaining lines after last hunk
        while(lineNumberOfCurrentChange <= textLines.length){
            const line:ILine={ text:textLines[lineNumberOfCurrentChange-1], textHightlightIndex:[] };
            currentLines.push(line);
            previousLines.push(line);
            lineNumberOfCurrentChange++;
            lineNumberOfPreviousChange++;
        }

        while(currentLines.length < previousLines.length)
            currentLines.push({textHightlightIndex:[]})
        while(currentLines.length > previousLines.length)
            previousLines.push({textHightlightIndex:[]})

        return {
            currentLines,
            previousLines,
        };
    
    }

    // static getDeltaFromLineConfig(lines:ILine[],maxLineWidth:number){        
    //     const operations:DeltaOperation[]=[];        
    //     const delta = {
    //         ops:operations,
    //     } as DeltaStatic;
        
    //     if(!lines.length) 
    //         return delta;
        
    //     let createOperation=(line:ILine)=>{            
    //         if(line.text != undefined){                
    //             const heightLightCount = line.textHightlightIndex.length;
    //             if(!!heightLightCount){
    //                 let insertedUptoIndex = -1;                    
    //                 line.textHightlightIndex.forEach((range)=>{                        
    //                     if(range.fromIndex > insertedUptoIndex+1 ){                            
    //                         operations.push({
    //                             insert:line.text!.substring(insertedUptoIndex+1,range.fromIndex),
    //                             attributes:{
    //                                 background:color.background,
    //                             }
    //                         });                            
    //                     }
    //                     operations.push({
    //                         insert:line.text!.substring(range.fromIndex, range.fromIndex+range.count),
    //                         attributes:{
    //                             background:color.forground,
    //                         }
    //                     })                        
    
    //                     insertedUptoIndex = range.fromIndex+range.count-1;
    //                 })
    //                 if(insertedUptoIndex < line.text.length-1){
    //                     operations.push({
    //                         insert: line.text.substring(insertedUptoIndex+1),
    //                         attributes:{
    //                             background:color.background,
    //                         } 
    //                     })
    //                 }                    
    //             } 
    //             else{
    //                 operations.push({
    //                     insert:line.text,                        
    //                 })
    //             }                
    //         }
    //     }

    //     createOperation(lines[0]);

    //     lines.slice(1).forEach((line)=>{
    //         operations.push({
    //             insert:`\n`
    //         })
    //         createOperation(line);
    //     })
    //     if(!lines[lines.length-1].text){
    //         operations.push({
    //             insert:`\n`
    //         })
    //     }
        
    //     return delta;        
    // }


    static getCoparableLineNumbers(currentLines:ILine[]){
        const lineNumbers:number[] = [];
        let lastComparableLine = 0;
        currentLines.forEach((l,index)=>{
            if(l.hightLightBackground){                
                if(lastComparableLine != index)
                    lineNumbers.push(index+1);
                lastComparableLine = index+1    
            }
            else if(l.text === undefined){
                if(lastComparableLine != index)
                    lineNumbers.push(index+1);
                lastComparableLine = index+1;    
            }    
                
        });
        return lineNumbers;
    }

    static async getDiff(filePath:string, isSgated?:boolean){
        const options =  ["--diff-algorithm=minimal",filePath];
        if(isSgated){
            options.splice(0,0,"--staged");
        }
        return await IpcUtils.getDiff(options);
    }
}