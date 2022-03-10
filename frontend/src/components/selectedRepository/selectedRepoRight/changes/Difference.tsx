import { RendererEvents, RepositoryInfo } from "common_library";
import { DeltaStatic } from "quill";
import React, { useEffect, useRef } from "react"
import ReactQuill, { Quill } from "react-quill";
import {DeltaOperation} from "quill";
import { EditorColors, IEditorLineColor, UiUtils, useMultiState } from "../../../../lib";

type TDiffLineType = "unchanged"|"added"|"removed";

interface IDifferenceProps{
    path:string;
    repoInfo:RepositoryInfo;
}

interface ILine{
    text?:string;
    textHightlightIndex:{
        fromIndex:number;
        count:number;
    }[];
    hightLightBackground?:boolean;
    transparent?:{
        lineCount:number;
    }
}

interface IState{
    currentLines:ILine[];
    previousLines:ILine[];    
    previousLineMaxWidth:number;
    currentLineMaxWidth:number;
}

function DifferenceComponent(props:IDifferenceProps){
    const tabSize = 4;
    const [state,setState] = useMultiState<IState>({
        currentLines:[],
        previousLines:[],        
        currentLineMaxWidth:300,
        previousLineMaxWidth:300,
    });

    const propsRef = useRef(props);
    useEffect(()=>{
        propsRef.current = props;
    },[props])

    useEffect(()=>{
        if(props.path) {
            console.log("path",props.path);
            window.ipcRenderer.send(RendererEvents.getFileContent().channel,props.path);            
        }
    },[props.path])
    
    const getEditorWidth = (lines:string[])=>{
        const width = Math.max(...lines.map(l=>{
            let length = l.length;
            if(l.includes('\t')) {
                let tabCount = l.match(/\t/g)?.length ?? 0;
                length += tabCount * (tabSize) - tabCount;
            }
            return length;
        }));
        return width;
    }

    const isMounted = useRef(false);
    const isFocussed = useRef(false);

    const setUiLines=(diff:string,textLines:string[])=>{
        console.log("textlines",textLines);
        const diffLines = diff.split('\n');
        // const sections:number[][]=[];
        let startIndexesOfSections = 0;
        let lineNumberOfFile= 0;

        const setFileLineNumber=(line:string)=>{
            const diffRange = line.split('+')[1].replace("@@","").trim().split(',');
            lineNumberOfFile = Number(diffRange[0]);
        }
        const getFileLineNumber=(line:string)=>{
            const diffRange = line.split('+')[1].replace("@@","").trim().split(',');
            return Number(diffRange[0]);
        }

        for(let i=0;i<diffLines.length; i++){
            const line = diffLines[i];
            if(line.startsWith("@@")) {
                startIndexesOfSections=i+1;
                setFileLineNumber(line);
                break;
            }
        }

        let currentLines:ILine[]=[];
        let previousLines:ILine[]=[];

        for(let i=0;i<lineNumberOfFile-1;i++){
            const previousLine:ILine={
                text:textLines[i],
                textHightlightIndex:[],
            }

            const currentLine:ILine={
                text:textLines[i],
                textHightlightIndex:[],
            }
            currentLines.push(currentLine);
            previousLines.push(previousLine);            
        }

        // let trackingIndex = 0;
        let currentCharTrackingIndex = 0;
        let previousCharTrackingIndex = 0;
        let currentLine:ILine ={
            textHightlightIndex:[],
        }
        //currentLines.push(currentLine);

        let previousLine:ILine ={
            textHightlightIndex:[],
        }
        //previousLines.push(previousLine);

        let currentChangeType:TDiffLineType = "unchanged";

        for(let i=startIndexesOfSections;i<diffLines.length;i++){
            const diffLine = diffLines[i];
            
            if(diffLine.startsWith("@@")){
                const nextStartingFileLineNumber = getFileLineNumber(diffLine);
                for(let i = lineNumberOfFile-1; i < nextStartingFileLineNumber-1;i++){                    
                    currentLines.push({
                        text:textLines[i],
                        textHightlightIndex:[],
                    });
                    previousLines.push({
                        text:textLines[i],
                        textHightlightIndex:[],
                    });                    
                }
                currentLine ={           
                    textHightlightIndex:[],
                }
                previousLine ={                        
                    textHightlightIndex:[],
                }

                currentLines.push(currentLine);
                previousLines.push(previousLine);

                lineNumberOfFile = nextStartingFileLineNumber;
            }            

            else if(diffLine.startsWith(" ")){
                currentChangeType = "unchanged";
                //if(currentLine.text === undefined) currentLine.text = textLines[lineNumberOfFile-1];                
                if(previousLine.text === undefined) previousLine.text = "";
                if(currentLine.text === undefined) currentLine.text = "";
                previousLine.text += diffLine.substring(1);
                currentLine.text += diffLine.substring(1);
                currentCharTrackingIndex += diffLine.length-1;
                previousCharTrackingIndex += diffLine.length-1;                
            }
            else if(diffLine.startsWith("+")){
                currentChangeType = "added";
                if(currentLine.text === undefined)currentLine.text = "";                
                currentLine.text! += diffLine.substring(1);
                currentLine.textHightlightIndex.push({fromIndex:currentCharTrackingIndex,count:diffLine.length-1});
                currentCharTrackingIndex += diffLine.length-1;
            }
            else if(diffLine.startsWith("-")){
                currentChangeType = "removed";
                if(!previousLine.text) previousLine.text = "";
                previousLine.text += diffLine.substring(1);
                console.log(diffLine,diffLine.length);            
                previousLine.textHightlightIndex.push({fromIndex:previousCharTrackingIndex,count:diffLine.length-1});
                previousCharTrackingIndex += diffLine.length-1;
            }
            else if(diffLine.startsWith("~")){
                currentLines.push(currentLine);

                currentLine ={
                    textHightlightIndex:[],
                    text:""
                }
                previousLines.push(previousLine);

                previousLine ={
                    textHightlightIndex:[],
                }
                currentCharTrackingIndex = 0;
                previousCharTrackingIndex = 0;

                if(currentChangeType !== "removed"){                    
                    
                    
                    lineNumberOfFile++;
                } 
                if(currentChangeType !== "added"){
                   
                }                                
            }
        }

        while(lineNumberOfFile < textLines.length){
            let lineConfig:ILine = {
                textHightlightIndex:[],
                text:textLines[lineNumberOfFile],
            };
            currentLines.push(lineConfig);
            previousLines.push(lineConfig);
            lineNumberOfFile++;
        }

        console.log("current lines",currentLines);
        console.log("Previous lines",previousLines);
        const previousLineMaxWidth = getEditorWidth(previousLines.map(x=>x.text?x.text:""));
        const currentLineMaxWidth = getEditorWidth(currentLines.map(x=>x.text?x.text:""));
        setState({currentLines,previousLines,previousLineMaxWidth,currentLineMaxWidth});
    }

    useEffect(()=>{
        isMounted.current = true;
        let textLines:string[] = [];
        window.ipcRenderer.on(RendererEvents.getFileContent().replyChannel,(e,lines:string[])=>{
            // setState({textLines:lines,editorWidth:Math.max(...lines.map(l=>l.length))});            
            textLines = lines;
            console.log("texts",lines);
            const options =  ["--word-diff=porcelain", "--word-diff-regex=.", "HEAD",propsRef.current.path];
            window.ipcRenderer.send(RendererEvents.diff().channel,options,propsRef.current.repoInfo);
        })
        window.ipcRenderer.on(RendererEvents.diff().replyChannel,(e,diff:string)=>{
            console.log(diff);
            setUiLines(diff,textLines);
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getFileContent().replyChannel,RendererEvents.diff().replyChannel])
        }
    },[]);

    const handleLineChange=(line:string,index:number)=>{
        const currentLines = state.currentLines.slice();
        currentLines[index] = {...currentLines[index],text:line};
        const currentLineMaxWidth = getEditorWidth(currentLines.map(x=> x.text?x.text:""))+1;
        setState({currentLines,currentLineMaxWidth});
    }

    const getEditorValue=(type:keyof IEditorLineColor)=>{
        console.log("state.currentLines",state.currentLines)
        const operations:DeltaOperation[]=[];
        const lines = type === "current"?state.currentLines:state.previousLines;
        let lineNumber=1;
        const delta = {
            ops:operations,
        } as DeltaStatic;
        
        if(!lines.length) 
            return delta;
        
        let createOperation=(line:ILine)=>{
            if(line.transparent) operations.push({
                insert: `${Array(state.currentLineMaxWidth).fill(" ").join("")}`,
                attributes:{background:"black"}
            })
            else if(line.text != undefined){
                operations.push({
                    insert:`${lineNumber} `
                })
                const heightLightCount = line.textHightlightIndex.length;
                if(!!heightLightCount){
                    let insertedUptoIndex = -1;                    
                    line.textHightlightIndex.forEach((range,index)=>{
                        // let prefix = lineIndex !== 0 && index === 0? "\n":"";
                        if(range.fromIndex > insertedUptoIndex+1 ){                            
                            operations.push({
                                insert:line.text!.substring(insertedUptoIndex+1,range.fromIndex),
                                attributes:{
                                    background:EditorColors.line[type].background,
                                }
                            });
                            // prefix = "";
                        }
                        operations.push({
                            insert:line.text!.substring(range.fromIndex, range.fromIndex+range.count),
                            attributes:{
                                background:EditorColors.line[type].forgound,
                            }
                        })                        
    
                        insertedUptoIndex += range.fromIndex+range.count;
                    })
                    if(insertedUptoIndex < line.text.length-1){
                        operations.push({
                            insert: line.text.substring(insertedUptoIndex+1),
                            attributes:{
                                background:EditorColors.line[type].background,
                            }
                        })
                    }
                } 
                else{
                    operations.push({
                        insert:line.text
                    })
                }
                lineNumber++;
            }
        }

        createOperation(lines[0]);

        lines.slice(1).forEach((line,lineIndex)=>{
            operations.push({
                insert:`\n `
            })
            createOperation(line);
        })
        console.log("operation type:"+type);
        console.log("operations",operations);
        
        return delta;        
    }
    
    return <div className="d-flex w-100 h-100 overflow-auto">
        <div  className="w-50 overflow-auto border-end" >
            <div className="d-flex flex-column minw-100" style={{width:`${state.currentLineMaxWidth}ch`}}>
            <ReactQuill  theme="snow" value={getEditorValue("previous")} onChange={value=>{console.log(value)}} 
                        modules={{"toolbar":false}}
                        
                    />
                {/* {
                    state.previousLines.map((line,index)=> (
                        <div className="d-flex flex-column align-items-stretch" key={index}>
                            <div>
                                
                                <div className="d-flex w-100 minw-100" >
                                    <span className="pe-1">{index+1}</span>
                                    <div>
                                        <span>{line.text?.substr(0,1)}</span>                                        
                                        <span>{line.text?.substr(1)}</span>
                                    </div>                                        
                                </div>
                                
                            </div>                            
                        </div>
                } */}
                
            </div>
        </div>
        <div className="w-50 overflow-auto " >
            <div className="d-flex flex-column minw-100" style={{width:`${state.currentLineMaxWidth}ch`}}>
                {
                    <ReactQuill  theme="snow" value={getEditorValue("current")} onChange={value=>{console.log(value)}} 
                        modules={{"toolbar":false}}
                    />
                    // state.currentLines.map((line,index)=> (
                    //     <div className="w-100">
                    //         {line.text !== undefined && <div key={index} className="position-relative">
                    //             <input type="text" style={{color:'transparent',background:'transparent',caretColor:'black'}}
                    //                 value={line.text} className="outline-none w-100"
                    //                 onChange={e => handleLineChange(e.target.value,index)}
                    //                 spellCheck={false}
                    //             />
                    //             <div className="position-absolute w-100" style={{top:0,left:0,zIndex:-5}}>
                    //                 <span>{line.text}</span>
                    //             </div>
                    //         </div>}
                    //         {line.text === undefined &&
                    //            <div className="bg-danger">
                    //                <div className="invisible">/</div>
                    //            </div> 
                    //         }
                    //     </div>
                        
                        
                    //     ))
                }
            </div>
            
        </div>

    </div>
}

export const Difference = React.memo(DifferenceComponent);