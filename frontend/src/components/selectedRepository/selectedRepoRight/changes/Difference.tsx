import { RendererEvents, RepositoryInfo } from "common_library";
import React, { useEffect } from "react"
import { UiUtils, useMultiState } from "../../../../lib";

interface IDifferenceProps{
    path:string;
    repoInfo:RepositoryInfo;
}

interface ILine{
    text?:string;
    hightlightIndexRanges:{
        fromIndex:number;
        count:number;
    }[];
    transparent?:{
        lineCount:number;
    }
}

interface IState{
    currentLines:ILine[];
    previousLines:ILine[];
    textLines:string[];
    editorWidth:number;
}

function DifferenceComponent(props:IDifferenceProps){
    const [state,setState]=useMultiState<IState>({currentLines:[],previousLines:[],textLines:[],editorWidth:300});

    useEffect(()=>{
        if(props.path) {            
            window.ipcRenderer.send(RendererEvents.getFileContent().channel,props.path);            
        }
    },[props.path])

    const setUiLines=(diff:string)=>{
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

        for(let i=0;i<lineNumberOfFile;i++){
            const previousLine:ILine={
                text:state.textLines[i],
                hightlightIndexRanges:[],
            }

            const currentLine:ILine={
                text:state.textLines[i],
                hightlightIndexRanges:[],
            }
            setState({
                currentLines:[...state.currentLines,currentLine],
                previousLines:[...state.previousLines,previousLine],
            });
        }

        // let trackingIndex = 0;
        let currentCharTrackingIndex = 0;
        let previousCharTrackingIndex = 0;
        let currentLines:ILine[]=[];
        let previousLines:ILine[]=[];
        let currentLine:ILine ={
            hightlightIndexRanges:[],
        }
        let previousLine:ILine ={
            hightlightIndexRanges:[],
        }

        for(let i=startIndexesOfSections;i<diffLines.length;i++){
            const diffLine = diffLines[i];
            
            if(diffLine.startsWith("@@")){
                const nextStartingFileLineNumber = getFileLineNumber(diffLine);
                for(let i = lineNumberOfFile-1; i < nextStartingFileLineNumber-1;i++){
                    currentLine ={
                        text:state.textLines[i],
                        hightlightIndexRanges:[],
                    }
                    previousLine ={
                        text:state.textLines[i],
                        hightlightIndexRanges:[],
                    }

                    currentLines.push(currentLine);
                    previousLines.push(previousLine);
                }
                lineNumberOfFile = nextStartingFileLineNumber;
            }            

            else if(diffLine.startsWith(" ")){
                if(!currentLine.text) currentLine.text = state.textLines[lineNumberOfFile-1];
                if(!previousLine.text) previousLine.text = "";
                previousLine.text += diffLine.substr(1);
                currentCharTrackingIndex += diffLine.length-1;
                previousCharTrackingIndex += diffLine.length-1;
            }
            else if(diffLine.startsWith("+")){
                currentLine.hightlightIndexRanges.push({fromIndex:currentCharTrackingIndex,count:diffLine.length-1});
                currentCharTrackingIndex += diffLine.length-1;
            }
            else if(diffLine.startsWith("-")){
                if(!previousLine.text) previousLine.text = "";
                previousLine.text += diffLine.substr(1);
                previousLine.hightlightIndexRanges.push({fromIndex:previousCharTrackingIndex,count:diffLine.length-1});
                previousCharTrackingIndex += diffLine.length-1;
            }
            else if(diffLine.startsWith("~")){
                currentLines.push(currentLine);
                previousLines.push(previousLine);
                currentLine ={
                    hightlightIndexRanges:[],
                }
                previousLine ={
                    hightlightIndexRanges:[],
                }
                previousCharTrackingIndex = 0;
                currentCharTrackingIndex = 0;
                lineNumberOfFile++;
            }
        }

        console.log("current lines",currentLines);
        console.log("Previous lines",previousLines);
        setState({currentLines,previousLines});
    }

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.getFileContent().replyChannel,(e,lines:string[])=>{
            setState({textLines:lines,editorWidth:Math.max(...lines.map(l=>l.length))});            
        })
        window.ipcRenderer.on(RendererEvents.diff().replyChannel,(e,result:string)=>{
            console.log(result);
            setUiLines(result);
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getFileContent().replyChannel,RendererEvents.diff().replyChannel])
        }
    },[]);

    useEffect(()=>{
        const options =  ["--word-diff=porcelain", "--word-diff-regex=.", "HEAD",props.path];
        window.ipcRenderer.send(RendererEvents.diff().channel,options,props.repoInfo);
    },[state.textLines])
    
    return <div className="d-flex w-100 h-100 overflow-auto">
        <div  className="w-50 overflow-auto border-end" style={{whiteSpace: "pre"}}>
            <div className="d-flex flex-column" style={{width:`${state.editorWidth}ch`}}>
                {
                    state.previousLines.map((line,index)=> (
                        <div className="d-flex flex-column align-items-stretch" key={index}>
                            <div>
                                
                                <div className="d-flex w-100">
                                    <span className="pe-1">{index+1}</span>    
                                    <input
                                        type="text" 
                                        value={line.text} className="outline-none flex-grow-1" 
                                        onChange={_=>{}}
                                        spellCheck={false} 
                                    />
                                </div>
                                
                            </div>                            
                        </div>
                    ))
                }
            </div>
        </div>
        <div className="w-50 overflow-auto " >
            <div className="d-flex flex-column" style={{width:`${state.editorWidth}ch`}}>
                {
                    state.currentLines.map((line,index)=> (
                        <input key={index} type="text" 
                            value={line.text} className="outline-none"
                            onChange={_=>{}}
                            spellCheck={false}
                        />))
                }
            </div>
            
        </div>

    </div>
}

export const Difference = React.memo(DifferenceComponent);