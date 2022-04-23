import { RendererEvents, RepositoryInfo } from "common_library";
import { DeltaStatic,DeltaOperation ,Quill} from "quill";
import React, { useEffect, useRef } from "react"
import ReactQuill from "react-quill";
import { EditorColors, EnumCustomBlots, ILine, ILineHighlight, UiUtils, useMultiState } from "../../../../lib";
import { DiffUtils, TDiffLineType } from "../../../../lib/utils/DiffUtils";

interface IDifferenceProps {
    path:string;
    repoInfo:RepositoryInfo;
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
    


    const isMounted = useRef(false);

    const setUiLines=(diff:string,textLines:string[])=>{
                
        let lineConfigs = DiffUtils.GetUiLines(diff,textLines);
        const previousLineMaxWidth = DiffUtils.getEditorWidth(lineConfigs.previousLines.map(x=>x.text?x.text:""));
        const currentLineMaxWidth = DiffUtils.getEditorWidth(lineConfigs.currentLines.map(x=>x.text?x.text:""));
        setState({
            currentLines:lineConfigs.currentLines,
            previousLines:lineConfigs.previousLines,
            previousLineMaxWidth,
            currentLineMaxWidth
        });
    }        

    useEffect(()=>{        
        let delta = DiffUtils.getDeltaFromLineConfig(state.previousLines,EditorColors.line.previous,state.previousLineMaxWidth);
        let lineDelta = DiffUtils.getDeltaForLineNumber(state.previousLines);
        console.log("previous lines",state.previousLines);
        console.log("previous line delta",lineDelta);
        setState({previousLineDelta:delta,previousLineNumberDelta:lineDelta});
    },[state.previousLines])

    useEffect(()=>{        
        let delta = DiffUtils.getDeltaFromLineConfig(state.currentLines,EditorColors.line.current,state.currentLineMaxWidth);
        let lineDelta = DiffUtils.getDeltaForLineNumber(state.currentLines);
        console.log("current lines",state.currentLines);
        setState({currentLineDelta:delta,currentLineNumberDelta:lineDelta});
    },[state.currentLines])

    useEffect(()=>{
        console.log("previous deltas",state.previousLineDelta);
        let quill = previousChangesEditorRef.current?.getEditor();        
        if(!quill) return;
        quill.root.style.minWidth = state.previousLineMaxWidth+"ch";
        DiffUtils.formatLinesBackground(quill,state.previousLines,EnumCustomBlots.PreviousBackground);        
    },[state.previousLineDelta])

    useEffect(()=>{        
        let previousChangeScroll = previousScrollContainerRef.current;
        let currentChangeScroll = currentScrollContainerRef.current;
        console.log(currentChangesEditorRef?.current?.getEditor()?.root?.classList);
        
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

    const setNavigationData=()=>{

    }

    useEffect(()=>{
        console.log("current delta",state.currentLineDelta);
        var quill = currentChangesEditorRef.current?.getEditor();
        if(!quill) return;
        quill.root.style.minWidth = state.currentLineMaxWidth+"ch";
        DiffUtils.formatLinesBackground(quill,state.currentLines,EnumCustomBlots.CurrentBackground);
        setNavigationData();
    },[state.currentLineDelta])
   

    useEffect(()=>{
        isMounted.current = true;
        currentChangesEditorRef.current?.getEditor().root.setAttribute("spellcheck","false");
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
                    onChange={(value)=>{}} readOnly
                     />
            </div>
            <div className="d-flex flex-column" style={{width:`${state.previousLineMaxWidth}ch`}}>
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
