import { RendererEvents, RepositoryInfo } from "common_library";
import React, { useEffect } from "react"
import { UiUtils, useMultiState } from "../../../../lib";
import { SelectedFile } from "./SelectedFile";

interface IDifferenceProps{
    path:string;
    repoInfo:RepositoryInfo;
}

interface IState{
    lines:string[];
    editorWidth:number;
}

function DifferenceComponent(props:IDifferenceProps){
    const [state,setState]=useMultiState<IState>({lines:[],editorWidth:300});

    useEffect(()=>{
        if(props.path) {            
            const options =  ["--word-diff=porcelain", "--word-diff-regex=.", "HEAD",props.path]
            window.ipcRenderer.send(RendererEvents.getFileContent().channel,props.path);
            window.ipcRenderer.send(RendererEvents.diff().channel,options,props.repoInfo);
        }
    },[props.path])

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.getFileContent().replyChannel,(e,lines:string[])=>{
            setState({lines:lines,editorWidth:Math.max(...lines.map(l=>l.length))});            
        })
        window.ipcRenderer.on(RendererEvents.diff().replyChannel,(e,result:string)=>{
            console.log(result);
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getFileContent().replyChannel,RendererEvents.diff().replyChannel])
        }
    },[])
    
    return <div className="d-flex w-100 h-100 overflow-auto">
        <div  className="w-50 overflow-auto border-end" style={{whiteSpace: "pre"}}>
            <div className="d-flex flex-column" style={{width:`${state.editorWidth}ch`}}>
                {
                    state.lines.map((line,index)=> (
                    <input 
                        key={index} type="text" 
                        value={line} className="outline-none" 
                        onChange={_=>{}}
                        spellCheck={false} 
                    />))
                }
            </div>
            {state.lines.map((line,index)=> (<div key={index}>{line}</div>))}
        </div>
        <div className="w-50 overflow-auto " >
            <div className="d-flex flex-column" style={{width:`${state.editorWidth}ch`}}>
                {
                    state.lines.map((line,index)=> (
                        <input key={index} type="text" 
                            value={line} className="outline-none"
                            onChange={_=>{}}
                            spellCheck={false}
                        />))
                }
            </div>
            
        </div>

    </div>
}

export const Difference = React.memo(DifferenceComponent);