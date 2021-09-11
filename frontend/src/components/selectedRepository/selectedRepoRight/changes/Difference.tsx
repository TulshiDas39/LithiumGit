import { RendererEvents } from "common_library";
import React, { useEffect } from "react"
import { useMultiState } from "../../../../lib";
import { SelectedFile } from "./SelectedFile";

interface IDifference{
    path:string;
}

interface IState{
    lines:string[];
    rightEditorWidth:number;
}

function DifferenceComponent(props:IDifference){
    const [state,setState]=useMultiState<IState>({lines:[],rightEditorWidth:300});

    useEffect(()=>{
        if(props.path) window.ipcRenderer.send(RendererEvents.getFileContent().channel,props.path);
    },[props.path])

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.getFileContent().replyChannel,(e,lines:string[])=>{
            setState({lines:lines,rightEditorWidth:Math.max(...lines.map(l=>l.length))});            
        })
    },[])
    
    return <div className="d-flex w-100 h-100 overflow-auto">
        <div  className="w-50 overflow-auto border-end" style={{whiteSpace: "pre"}}>
            <div className="d-flex flex-column" style={{width:`${state.rightEditorWidth}ch`}}>
                {
                    state.lines.map((line,index)=> (
                    <input 
                        key={index} type="text" 
                        value={line} className="outline-none" 
                        onChange={e=>{e.preventDefault();e.stopPropagation(); return false;}}
                        spellCheck={false} 
                    />))
                }
            </div>
            {state.lines.map((line,index)=> (<div key={index}>{line}</div>))}
        </div>
        <div className="w-50 overflow-auto " >
            <div className="d-flex flex-column" style={{width:`${state.rightEditorWidth}ch`}}>
                {
                    state.lines.map((line,index)=> (
                        <input key={index} type="text" 
                            value={line} className="outline-none"
                            onChange={e=>{}}
                            spellCheck={false}
                        />))
                }
            </div>
            
        </div>

    </div>
}

export const Difference = React.memo(DifferenceComponent);