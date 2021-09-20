import { RendererEvents, RepositoryInfo } from "common_library";
import React, { useEffect, useRef } from "react"
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
    editorWidth:number;
}

function DifferenceComponent(props:IDifferenceProps){
    const [state,setState]=useMultiState<IState>({currentLines:[],previousLines:[],editorWidth:300});

    useEffect(()=>{
        if(props.path) {            
            window.ipcRenderer.send(RendererEvents.getFileContent().channel,props.path);            
        }
    },[props.path])

    const isMounted = useRef(false);
    const isFocussed = useRef(false);

    const setUiLines=(diff:string,textLines:string[])=>{
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
                hightlightIndexRanges:[],
            }

            const currentLine:ILine={
                text:textLines[i],
                hightlightIndexRanges:[],
            }
            currentLines.push(currentLine);
            previousLines.push(previousLine);            
        }

        // let trackingIndex = 0;
        let currentCharTrackingIndex = 0;
        let previousCharTrackingIndex = 0;
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
                        text:textLines[i],
                        hightlightIndexRanges:[],
                    }
                    previousLine ={
                        text:textLines[i],
                        hightlightIndexRanges:[],
                    }

                    currentLines.push(currentLine);
                    previousLines.push(previousLine);
                }
                lineNumberOfFile = nextStartingFileLineNumber;
            }            

            else if(diffLine.startsWith(" ")){
                if(!currentLine.text) currentLine.text = textLines[lineNumberOfFile-1];
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
        isMounted.current = true;
        let textLines:string[] = [];
        window.ipcRenderer.on(RendererEvents.getFileContent().replyChannel,(e,lines:string[])=>{
            // setState({textLines:lines,editorWidth:Math.max(...lines.map(l=>l.length))});            
            textLines = lines;
            const options =  ["--word-diff=porcelain", "--word-diff-regex=.", "HEAD",props.path];
            window.ipcRenderer.send(RendererEvents.diff().channel,options,props.repoInfo);
        })
        window.ipcRenderer.on(RendererEvents.diff().replyChannel,(e,diff:string)=>{
            console.log(diff);
            setUiLines(diff,textLines);
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getFileContent().replyChannel,RendererEvents.diff().replyChannel])
        }
    },[]);

    const getSelectionPosition = () => {
        var selection = window.getSelection();
        const node = selection?.focusNode as any; 
        console.log(node.data[selection?.focusOffset!]);
        console.log(selection?.focusOffset);
    }
    const handleFocus = ()=>{
        isFocussed.current = true;
    }

    const handleLineChange=(line:string,index:number)=>{
        setState({
            currentLines:[
                ...state.currentLines.slice(0,index),
                {
                    ...state.currentLines[index],
                    text:line,
                },
                ...state.currentLines.slice(index+1),
            ]
        })
    }
    
    return <div className="d-flex w-100 h-100 overflow-auto">
        <div  className="w-50 overflow-auto border-end" style={{whiteSpace: "pre"}}>
            <div className="d-flex flex-column" style={{width:`${state.editorWidth}ch`}}>
                {
                    state.previousLines.map((line,index)=> (
                        <div className="d-flex flex-column align-items-stretch" key={index}>
                            <div>
                                
                                <div className="d-flex w-100 mw-100">
                                    <span className="pe-1">{index+1}</span>
                                    <div>
                                        <span>{line.text?.substr(0,1)}</span>                                        
                                        <span>{line.text?.substr(1)}</span>
                                    </div>    
                                    {/* <input
                                        type="text" 
                                        value={line.text} className="outline-none flex-grow-1 bg-danger" 
                                        onChange={_=>{}}|
                                        spellCheck={false} 
                                    /> */}
                                </div>
                                
                            </div>                            
                        </div>
                    ))
                }
            </div>
        </div>
        <div className="w-50 overflow-auto " >
            <div className="d-flex flex-column mw-100" style={{width:`${state.editorWidth}ch`}}>
                {
                    state.currentLines.map((line,index)=> (
                        // <div key={index} contentEditable suppressContentEditableWarning onClick={_=> handleFocus()}
                        //     onBlur={_=> {console.log("blurring"); isFocussed.current=false;}} 
                        //     onKeyPress={(e)=>{e.preventDefault(); console.log("key pressing");}}>
                        //     <span>{line.text?.substr(0,1)}</span>                            
                        //     <span>{line.text?.substr(1)}</span>
                        // </div>
                        <div key={index} className="position-relative">
                            <input type="text" style={{color:'transparent',background:'transparent',caretColor:'black'}}
                                value={line.text} className="outline-none w-100"
                                onChange={e => handleLineChange(e.target.value,index)}
                                spellCheck={false}
                            />
                            <div className="position-absolute w-100" style={{top:0,left:0,zIndex:-5}}>
                                <span>{line.text}</span>
                            </div>
                        </div>
                        
                        ))
                }
            </div>
            
        </div>

    </div>
}

export const Difference = React.memo(DifferenceComponent);