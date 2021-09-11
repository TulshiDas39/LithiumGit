import { RendererEvents } from "common_library";
import React, { useEffect } from "react"
import { useMultiState } from "../../../../lib";
import { SelectedFile } from "./SelectedFile";

interface IDifference{
    path:string;
}

interface IState{
    lines:string[];
}

function DifferenceComponent(props:IDifference){
    const [state,setState]=useMultiState<IState>({lines:[]});

    useEffect(()=>{
        if(props.path) window.ipcRenderer.send(RendererEvents.getFileContent().channel,props.path);
    },[props.path])

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.getFileContent().replyChannel,(e,lines:string[])=>{
            setState({lines:lines});
        })
    },[])
    
    return <div className="d-flex w-100">
        <div  className="w-50 overflow-auto" style={{whiteSpace: "pre-wrap"}}>              
            {state.lines.map((line,index)=> (<div key={index}>{line}</div>))}
        </div>
        <div className="w-50">
            <div></div>
        </div>

    </div>
}

export const Difference = React.memo(DifferenceComponent);