import { RendererEvents, RepositoryInfo } from "common_library";
import { DeltaStatic,DeltaOperation ,Quill} from "quill";
import React, { useEffect, useRef } from "react"
import ReactQuill from "react-quill";
import { EditorColors, EnumCustomBlots, ILineHighlight, UiUtils, useMultiState } from "../../../../lib";


type TDiffLineType = "unchanged"|"added"|"removed";

interface IDifferenceProps {
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
    previousLineDelta:DeltaStatic,
    currentLineDelta:DeltaStatic,
    previousLineNumberDelta:DeltaStatic,    
    currentLineNumberDelta:DeltaStatic,    
}

function DifferenceComponent(props:IDifferenceProps){
    const tabSize = 4;
    const [state,setState] = useMultiState<IState>({
        currentLines:[],
        previousLines:[],        
        currentLineMaxWidth:300,
        previousLineMaxWidth:300,
        currentLineDelta:{ops:[], } as any ,
        previousLineDelta:{ops:[] } as any,
        previousLineNumberDelta:{ops:[]} as any,
        currentLineNumberDelta:{ops:[]} as any,
    });

    const propsRef = useRef(props);
    useEffect(()=>{
        propsRef.current = props;
    },[props])

    useEffect(()=>{
        if(props.path) {            
            window.ipcRenderer.send(RendererEvents.getFileContent().channel,props.path);            
        }
    },[props.path])

    const previousChangesEditorRef = useRef<ReactQuill>();
    const currentChangesEditorRef = useRef<ReactQuill>();
    const previousScrollContainerRef = useRef<HTMLDivElement>();
    const currentScrollContainerRef = useRef<HTMLDivElement>();
    
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

    const setUiLines=(diff:string,textLines:string[])=>{        
        const diffLines = diff.split('\n');
        // const sections:number[][]=[];
        console.log("text lines",textLines);
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
                previousLine.textHightlightIndex.push({fromIndex:previousCharTrackingIndex,count:diffLine.length-1});
                previousCharTrackingIndex += diffLine.length-1;
            }
            else if(diffLine.startsWith("~")){
                currentLines.push(currentLine);

                
                previousLines.push(previousLine);

                
                currentCharTrackingIndex = 0;
                previousCharTrackingIndex = 0;                

                if(currentChangeType !== "removed"){                    
                    
                    if(currentChangeType === "added"){
                        currentLine.hightLightBackground = true;
                        if(previousLine.text !== undefined)
                            previousLine.hightLightBackground = true;
                    }
                    else if(diffLines[i-1].startsWith("~")){                        
                        if(textLines[lineNumberOfFile-1] === ""){
                            currentLine.text = "";
                            currentLine.hightLightBackground = true;
                        }
                        else{
                            previousLine.hightLightBackground = true;
                            previousLine.text = "";
                        }
                    }
                    lineNumberOfFile++;
                } 
                else {                   
                    previousLine.hightLightBackground = true;
                    if(currentLine.text !== undefined) currentLine.hightLightBackground = true;                   
                }
                currentLine ={
                    textHightlightIndex:[],
                }
                previousLine ={
                    textHightlightIndex:[],
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
        
        const previousLineMaxWidth = getEditorWidth(previousLines.map(x=>x.text?x.text:""));
        const currentLineMaxWidth = getEditorWidth(currentLines.map(x=>x.text?x.text:""));
        setState({currentLines,previousLines,previousLineMaxWidth,currentLineMaxWidth});
    }
    

    const formatLinesBackground=(quill:Quill,lines:ILine[],format:string)=>{                
        let index = 0;
        for(let i = 0;i<lines.length;i++){
            let line = lines[i];
            if(line.hightLightBackground)
                quill?.formatLine(index,line?.text?.length??0,format,true,"silent");

            else if(line.text === undefined)
                quill?.formatLine(index,0,EnumCustomBlots.TransparentBackground,true,"silent");
            if(line.text !== undefined){
                index = index + line.text.length+1 
            }
            else
            index += 1;
        }              
    }
    

    const getEditorValue=(lines:ILine[],color:ILineHighlight)=>{        
        const operations:DeltaOperation[]=[];        
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
                const heightLightCount = line.textHightlightIndex.length;
                if(!!heightLightCount){
                    let insertedUptoIndex = -1;                    
                    line.textHightlightIndex.forEach((range)=>{                        
                        if(range.fromIndex > insertedUptoIndex+1 ){                            
                            operations.push({
                                insert:line.text!.substring(insertedUptoIndex+1,range.fromIndex),
                                attributes:{
                                    background:color.background,
                                }
                            });                            
                        }
                        operations.push({
                            insert:line.text!.substring(range.fromIndex, range.fromIndex+range.count),
                            attributes:{
                                background:color.forground,
                            }
                        })                        
    
                        insertedUptoIndex = range.fromIndex+range.count-1;
                    })
                    if(insertedUptoIndex < line.text.length-1){
                        operations.push({
                            insert: line.text.substring(insertedUptoIndex+1),
                            attributes:{
                                background:color.background,
                            } 
                        })
                    }                    
                } 
                else{
                    operations.push({
                        insert:line.text,                        
                    })
                }                
            }
        }

        createOperation(lines[0]);

        lines.slice(1).forEach((line)=>{
            operations.push({
                insert:`\n`
            })
            createOperation(line);
        })        
        
        return delta;        
    }

    const getDeltaForLineNumber=(lines:ILine[])=>{
        const operations:DeltaOperation[]=[];

        let lineNumber = 1;
        for(let i=0;i<lines.length;i++){
            let line = lines[i];
            if(line.text !== undefined){
                operations.push({insert:`${lineNumber}\n`});
                lineNumber++;
            }
            else
                operations.push({insert:"\n"});
        }

        const delta = {
            ops:operations,
        } as DeltaStatic;
        
        return delta;

    }

    useEffect(()=>{        
        let delta = getEditorValue(state.previousLines,EditorColors.line.previous);
        let lineDelta = getDeltaForLineNumber(state.previousLines);
        console.log("previous lines",state.previousLines);
        console.log("previous line delta",lineDelta);
        setState({previousLineDelta:delta,previousLineNumberDelta:lineDelta});
    },[state.previousLines])

    useEffect(()=>{        
        let delta = getEditorValue(state.currentLines,EditorColors.line.current);
        let lineDelta = getDeltaForLineNumber(state.currentLines);
        console.log("current lines",state.currentLines);
        setState({currentLineDelta:delta,currentLineNumberDelta:lineDelta});
    },[state.currentLines])

    useEffect(()=>{
        console.log("previous deltas",state.previousLineDelta);
        let quill = previousChangesEditorRef.current?.getEditor();        
        if(!quill) return;
        formatLinesBackground(quill,state.previousLines,EnumCustomBlots.PreviousBackground);        
    },[state.previousLineDelta])

    useEffect(()=>{        
        let previousChangeScroll = previousScrollContainerRef.current;
        let currentChangeScroll = currentScrollContainerRef.current;
        
        let handler1 = (e:Event)=>{
            currentChangeScroll?.scrollTo({top:previousChangeScroll?.scrollTop});
        }

        let handler2 = (e:Event)=>{
            previousChangeScroll?.scrollTo({top:currentChangeScroll?.scrollTop});
        }

        if(previousChangeScroll && currentChangeScroll){
            previousChangeScroll.addEventListener("scroll",handler1)
            currentChangeScroll.addEventListener("scroll",handler2);
        }

        return ()=>{
            previousChangeScroll?.removeEventListener("scroll",handler1);
            currentChangeScroll?.removeEventListener("scroll",handler2);
        }
    },[]);

    useEffect(()=>{
        console.log("current delta",state.currentLineDelta);
        var quill = currentChangesEditorRef.current?.getEditor();
        if(!quill) return;
        formatLinesBackground(quill,state.currentLines,EnumCustomBlots.CurrentBackground);        
    },[state.currentLineDelta])
   

    useEffect(()=>{
        isMounted.current = true;
        let textLines:string[] = [];        
        window.ipcRenderer.on(RendererEvents.getFileContent().replyChannel,(e,lines:string[])=>{
            textLines = lines;
            const options =  ["--word-diff=porcelain", "--word-diff-regex=.","--diff-algorithm=minimal", "HEAD",propsRef.current.path];
            window.ipcRenderer.send(RendererEvents.diff().channel,options,propsRef.current.repoInfo);
        })
        window.ipcRenderer.on(RendererEvents.diff().replyChannel,(e,diff:string)=>{
            setUiLines(diff,textLines);
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getFileContent().replyChannel,RendererEvents.diff().replyChannel])
        }
    },[]);
 

    
    
    return <div className="d-flex w-100 h-100 gs-overflow-y-auto">
        <div ref={previousScrollContainerRef as any} className="d-flex w-50 gs-overflow-x-auto border-end" >
            <div>
                <ReactQuill value={state.previousLineNumberDelta} modules={{"toolbar":false}} 
                    onChange={(value)=>{}} readOnly/>
            </div>
            <div className="d-flex flex-column" style={{width:`${state.currentLineMaxWidth}ch`}}>
                <ReactQuill  ref={previousChangesEditorRef as React.LegacyRef<ReactQuill> } value={state.previousLineDelta}  
                    onChange={value=>{}} 
                    modules={{"toolbar":false}}
                    readOnly                    
                        />                
            </div>
        </div>
        <div ref={currentScrollContainerRef as any} className="d-flex w-50 gs-overflow-x-auto" >
            <div>
                <ReactQuill value={state.currentLineNumberDelta} modules={{"toolbar":false}} 
                    onChange={(value)=>{}} readOnly/>
            </div>

            <div className="d-flex flex-column" style={{width:`${state.currentLineMaxWidth}ch`}}>
                {
                    <ReactQuill ref={currentChangesEditorRef as any}  theme="snow" value={state.currentLineDelta} onChange={value=>{}} 
                        modules={{"toolbar":false}}
                    />                    
                }
            </div>
            
        </div>

    </div>
}

export const Difference = React.memo(DifferenceComponent);
