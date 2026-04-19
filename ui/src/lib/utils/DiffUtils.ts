import { ILine } from "../interfaces";
import { EnumCustomBlots } from "../enums";
import { IpcUtils } from "./IpcUtils";
export type TDiffLineType = "unchanged"|"added"|"removed";

type MyersOp = { type: 'equal'|'delete'|'insert'; oldIdx: number; newIdx: number; len: number };

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

    private static myersDiff(a: string, b: string): MyersOp[] {
            const n = a.length, m = b.length;
            const max = n + m;
            // V[k] maps diagonal k to the furthest-reaching x index
            const V = new Int32Array(2 * max + 2);
            // trace[d] stores snapshot of V after each d step
            const trace: Int32Array[] = [];

            outer:
            for(let d = 0; d <= max; d++){
                trace.push(V.slice());
                for(let k = -d; k <= d; k += 2){
                    const vi = k + max;
                    let x: number;
                    if(k === -d || (k !== d && V[vi - 1] < V[vi + 1])){
                        x = V[vi + 1];         // move down (insert)
                    } else {
                        x = V[vi - 1] + 1;     // move right (delete)
                    }
                    let y = x - k;
                    // follow diagonal (equal characters)
                    while(x < n && y < m && a[x] === b[y]){ x++; y++; }
                    V[vi] = x;
                    if(x >= n && y >= m){ trace.push(V.slice()); break outer; }
                }
            }

            // Backtrack through trace to reconstruct the edit path
            const ops: MyersOp[] = [];
            let x = n, y = m;
            for(let d = trace.length - 1; d > 0; d--){
                if(x === 0 && y === 0) break;
                const Vprev = trace[d - 1];
                const k = x - y;
                const vi = k + max;
                const prevK = (k === -( d-1) || (k !== (d-1) && Vprev[vi - 1] < Vprev[vi + 1]))
                    ? k + 1
                    : k - 1;
                const prevX = Vprev[prevK + max];
                const prevY = prevX - prevK;
                // walk diagonals (equals) from (prevX,prevY) to snake end
                while(x > prevX + (x - prevX - (y - prevY)) && y > prevY + (y - prevY - (x - prevX))){
                    x--; y--;
                    ops.push({ type: 'equal', oldIdx: x, newIdx: y, len: 1 });
                }
                if(d > 0){
                    if(x > prevX){ x--; ops.push({ type: 'delete', oldIdx: x, newIdx: y, len: 1 }); }
                    else if(y > prevY){ y--; ops.push({ type: 'insert', oldIdx: x, newIdx: y, len: 1 }); }
                }
            }
            // Any remaining diagonal at start
            while(x > 0 && y > 0){ x--; y--; ops.push({ type: 'equal', oldIdx: x, newIdx: y, len: 1 }); }

            return ops.reverse();
        };

        private static computeCharDiff=(oldStr:string, newStr:string)=>{
            // Trim common prefix/suffix to reduce the problem size before running Myers
            let prefixLen = 0;
            const minLen = Math.min(oldStr.length, newStr.length);
            while(prefixLen < minLen && oldStr[prefixLen] === newStr[prefixLen]) prefixLen++;

            let oldSuffixStart = oldStr.length, newSuffixStart = newStr.length;
            while(oldSuffixStart > prefixLen && newSuffixStart > prefixLen
                && oldStr[oldSuffixStart - 1] === newStr[newSuffixStart - 1]){
                oldSuffixStart--; newSuffixStart--;
            }

            const oldCore = oldStr.substring(prefixLen, oldSuffixStart);
            const newCore = newStr.substring(prefixLen, newSuffixStart);
            console.log("Computing char diff with oldCore:", oldCore, "newCore:", newCore);

            if(oldCore.length === 0 && newCore.length === 0)
                return { prevHighlights: [], currHighlights: [] };

            const oldChanged = new Array(oldStr.length).fill(false) as boolean[];
            const newChanged = new Array(newStr.length).fill(false) as boolean[];

            const ops = DiffUtils.myersDiff(oldCore, newCore);
            for(const op of ops){
                if(op.type === 'delete')  oldChanged[prefixLen + op.oldIdx] = true;
                else if(op.type === 'insert') newChanged[prefixLen + op.newIdx] = true;
            }

            const toRanges = (changed: boolean[]) => {
                const ranges: { fromIndex: number; count: number }[] = [];
                let k = 0;
                while(k < changed.length){
                    if(changed[k]){
                        const from = k;
                        while(k < changed.length && changed[k]) k++;
                        ranges.push({ fromIndex: from, count: k - from });
                    } else { k++; }
                }
                return ranges;
            };

            return { prevHighlights: toRanges(oldChanged), currHighlights: toRanges(newChanged) };
        };

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

        // Myers Diff Algorithm (O(ND) shortest edit script).
        // Returns the edit script as an array of operations: equal | delete | insert.        

        let removedBuffer:string[] = [];
        let addedBuffer:string[] = [];

        const flushBuffers=()=>{
            const maxLen = Math.max(removedBuffer.length, addedBuffer.length);
            for(let i=0;i<maxLen;i++){
                const hasOld = i < removedBuffer.length;
                const hasNew = i < addedBuffer.length;
                if(hasOld && hasNew){
                    const { prevHighlights, currHighlights } = DiffUtils.computeCharDiff(removedBuffer[i], addedBuffer[i]);
                    const highlightBackground = prevHighlights.length > 0 || currHighlights.length > 0;
                    previousLines.push({
                        text: removedBuffer[i],
                        textHightlightIndex: prevHighlights,
                        hightLightBackground: highlightBackground,
                    });
                    currentLines.push({
                        text: addedBuffer[i],
                        textHightlightIndex: currHighlights,
                        hightLightBackground: highlightBackground,
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