import { EnumChangeType, RendererEvents, RepositoryInfo } from "common_library";
import { DeltaStatic} from "quill";
import React, { useCallback, useEffect, useRef } from "react"
import ReactQuill from "react-quill";
import { shallowEqual, useDispatch } from "react-redux";
import { EditorColors, EnumChangeGroup, EnumCustomBlots, ILine, UiUtils, useMultiState } from "../../../../lib";
import { DiffUtils } from "../../../../lib/utils/DiffUtils";
import { StringUtils } from "../../../../lib/utils/StringUtils";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { ActionUI } from "../../../../store/slices/UiSlice";

interface IDifferenceProps {
    path:string;
    repoInfo:RepositoryInfo;
    refreshV:number;
    changeGroup:EnumChangeGroup;
    changeType:EnumChangeType;
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
    comparableLineNumbers:number[],
}

function DifferenceComponent(props:IDifferenceProps){

    const store = useSelectorTyped(state=>({
        currentStep:state.ui.changes?.currentStep,
    }),shallowEqual);

    const dispatch= useDispatch();
    
    const [state,setState] = useMultiState<IState>({
        currentLines:[],
        previousLines:[],        
        currentLineMaxWidth:300,
        previousLineMaxWidth:300,
        currentLineDelta:{ops:[], } as any ,
        previousLineDelta:{ops:[] } as any,
        previousLineNumberDelta:{ops:[]} as any,
        currentLineNumberDelta:{ops:[]} as any,
        comparableLineNumbers:[],
    });

    const propsRef = useRef(props);
    useEffect(()=>{
        propsRef.current = props;
    },[props])

    const getFileContent=()=>{
        if(props.path) {    
            const joinedPath = window.ipcRenderer.sendSync(RendererEvents.joinPath().channel,props.repoInfo.path,props.path);
            if(props.changeGroup === EnumChangeGroup.STAGED){
                const options = [":"+props.path];
                window.ipcRenderer.send(RendererEvents.gitShow().channel,props.repoInfo,options)
            }
            else{
                window.ipcRenderer.send(RendererEvents.getFileContent().channel,joinedPath);
            }
            
        }
    }

    const getDiff=()=>{
        const options =  ["--word-diff=porcelain", "--word-diff-regex=.","--diff-algorithm=minimal",propsRef.current.path];
        if(propsRef.current.changeGroup === EnumChangeGroup.STAGED){
            options.splice(0,0,"--staged");
        }
        window.ipcRenderer.send(RendererEvents.diff().channel,options,propsRef.current.repoInfo);
    }

    const getShowResult=()=>{
        //git show HEAD:test2.ts
        if(!props.path) return;
        const options =  [`HEAD:${propsRef.current.path}`];
        window.ipcRenderer.send(RendererEvents.gitShow().channel,propsRef.current.repoInfo,options);
    }

    useEffect(()=>{        
        if(props.changeType === EnumChangeType.DELETED) {
            getShowResult();
        }
        else getFileContent();

    },[props.path,props.changeGroup,props.refreshV])

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
        setState({previousLineDelta:delta,previousLineNumberDelta:lineDelta});
    },[state.previousLines])

    useEffect(()=>{        
        let delta = DiffUtils.getDeltaFromLineConfig(state.currentLines,EditorColors.line.current,state.currentLineMaxWidth);
        let lineDelta = DiffUtils.getDeltaForLineNumber(state.currentLines);
        let lineNumbers = DiffUtils.getCoparableLineNumbers(state.currentLines);
        setState({currentLineDelta:delta,currentLineNumberDelta:lineDelta,comparableLineNumbers:lineNumbers});
    },[state.currentLines])

    useEffect(()=>{
        let quill = previousChangesEditorRef.current?.getEditor();        
        if(!quill) return;
        quill.root.style.minWidth = state.previousLineMaxWidth+"ch";
        DiffUtils.formatLinesBackground(quill,state.previousLines,EnumCustomBlots.PreviousBackground);        
    },[state.previousLineDelta])

    useEffect(()=>{
        let previousChangeScroll = previousScrollContainerRef.current;
        let currentChangeScroll = currentScrollContainerRef.current;        
        
        let handler1 = (e:Event)=>{
            currentChangeScroll?.scrollTo({
                top:previousChangeScroll?.scrollTop,
                left:previousChangeScroll?.scrollLeft,
            });
        }

        let handler2 = (e:Event)=>{
            previousChangeScroll?.scrollTo({
                top:currentChangeScroll?.scrollTop,
                left:currentChangeScroll?.scrollLeft,
            });
        }

        if(previousChangeScroll && currentChangeScroll){
            previousChangeScroll.addEventListener("scroll",handler1)
            currentChangeScroll.addEventListener("scroll",handler2);
        }

        return ()=>{
            previousChangeScroll?.removeEventListener("scroll",handler1);
            currentChangeScroll?.removeEventListener("scroll",handler2);
        }
    },[previousScrollContainerRef.current,currentScrollContainerRef.current])

    const initialiseNavigationData=()=>{
        dispatch(ActionUI.setTotalComparable(state.comparableLineNumbers.length));                
        dispatch(ActionUI.setComparableStep(1));                
    }

    const focusInCurrentStep=(currentStep?:number)=>{
        if(!currentStep)return;        

        const focusElem = currentChangesEditorRef.current?.getEditor().root.children.
            item(state.comparableLineNumbers[currentStep-1]);
        focusElem?.scrollIntoView({block:"center"});
    }

    useEffect(()=>{        
        focusInCurrentStep(store.currentStep);
    },[store.currentStep])

    useEffect(()=>{
        var quill = currentChangesEditorRef.current?.getEditor();
        if(!quill) return;
        quill.root.style.minWidth = state.currentLineMaxWidth+"ch";
        DiffUtils.formatLinesBackground(quill,state.currentLines,EnumCustomBlots.CurrentBackground);
        initialiseNavigationData();
        focusInCurrentStep(store.currentStep);
    },[state.currentLineDelta])
   
    const showContentOfDeletedFile=(lines:string[])=>{
        const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
        setState({previousLines:lineConfigs,currentLines:[]});
    }

    const showContentOfStagedFile=(lines:string[])=>{
        const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
        setState({previousLines:lineConfigs,currentLines:[]});
    }

    const showContentOfNewFile=(lines:string[])=>{
        const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
        setState({currentLines:lineConfigs,previousLines:[]});
    }

    useEffect(()=>{
        isMounted.current = true;
        currentChangesEditorRef.current?.getEditor().root.setAttribute("spellcheck","false");
        let textLines:string[] = [];        
        window.ipcRenderer.on(RendererEvents.getFileContent().replyChannel,(e,lines:string[])=>{
            const hasChanges = UiUtils.hasChanges(textLines,lines);
            if(!hasChanges) return;
            textLines = lines;
            if(propsRef.current.changeGroup === EnumChangeGroup.UN_STAGED || propsRef.current.changeGroup === EnumChangeGroup.CONFLICTED){
                getDiff();
            }
            else showContentOfNewFile(lines);
        })
        window.ipcRenderer.on(RendererEvents.diff().replyChannel,(e,diff:string)=>{
            setUiLines(diff,textLines);
        });

        window.ipcRenderer.on(RendererEvents.gitShow().replyChannel,(e,content:string)=>{
            const lines = new StringUtils().getLines(content);
            const hasChanges = UiUtils.hasChanges(textLines,lines);
            if(!hasChanges) return;
            textLines = lines;
            if(propsRef.current.changeType === EnumChangeType.DELETED) showContentOfDeletedFile(lines);            
            else if(propsRef.current.changeGroup === EnumChangeGroup.STAGED)  getDiff();//(lines);
            // get Diff();
        })

        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getFileContent().replyChannel,RendererEvents.diff().replyChannel])
        }
    },[]);
    
    const callbackForPreviousEditor = useCallback(()=>{
    },[state.previousLineDelta])

    const callbackForCurrentEditor = useCallback(()=>{
    },[state.currentLineDelta])
    
    return <div className="d-flex w-100 h-100 gs-overflow-y-auto">
        {(props.changeType === EnumChangeType.DELETED || props.changeGroup ===  EnumChangeGroup.CONFLICTED || props.changeGroup === EnumChangeGroup.UN_STAGED
        || props.changeGroup === EnumChangeGroup.STAGED) &&
            <div ref={previousScrollContainerRef as any} 
            className={`d-flex gs-overflow-x-auto border-end ${props.changeType === EnumChangeType.DELETED?'w-100':'w-50'}`} >
            <div>
                <ReactQuill value={state.previousLineNumberDelta} modules={{"toolbar":false}} 
                    onChange={callbackForPreviousEditor} readOnly                    
                     />
            </div>
            <div className="d-flex flex-column" style={{width:`${state.previousLineMaxWidth}ch`,minWidth:`100%`}}>
                <ReactQuill  ref={previousChangesEditorRef as React.LegacyRef<ReactQuill> } value={state.previousLineDelta}  
                    onChange={callbackForPreviousEditor} 
                    modules={{"toolbar":false}}
                    readOnly                                        
                        />                
            </div>
        </div>}
        {(props.changeGroup ===  EnumChangeGroup.UN_STAGED  || props.changeGroup ===  EnumChangeGroup.CONFLICTED || props.changeType === EnumChangeType.CREATED || props.changeGroup ===  EnumChangeGroup.STAGED ) && 
            <div ref={currentScrollContainerRef as any} className={`d-flex gs-overflow-x-auto ${props.changeType === EnumChangeType.CREATED?'w-100':'w-50'}`} >
            <div>
                <ReactQuill value={state.currentLineNumberDelta} modules={{"toolbar":false}} 
                    onChange={callbackForCurrentEditor} readOnly                    
                    />
            </div>

            <div className="d-flex flex-column" style={{width:`${state.currentLineMaxWidth}ch`,minWidth:`100%`}}>
                {
                    <ReactQuill ref={currentChangesEditorRef as any}  theme="snow" value={state.currentLineDelta} onChange={callbackForCurrentEditor} 
                        modules={{"toolbar":false}}                        
                        id="currentChangesEditor"
                    />                    
                }
            </div>
            
        </div>}

    </div>
}

export const Difference = React.memo(DifferenceComponent);
