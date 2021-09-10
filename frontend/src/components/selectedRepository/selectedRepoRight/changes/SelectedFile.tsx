import { RendererEvents } from "common_library";
import React from "react"
import { useEffect } from "react";
import { useMultiState } from "../../../../lib";
interface ISelectedFileProps{    
    selectedFilePath?:string;
}

interface IState{
    lines:string[];
}

function SelectedFileComponent(props:ISelectedFileProps){
    const [state,setState] = useMultiState<IState>({lines:[]});

    const handleInput=(e: React.FormEvent<HTMLDivElement>)=>{
        let t = e.target as HTMLDivElement;
        console.log(t.innerText);        
    }

    useEffect(()=>{
        if(props.selectedFilePath) window.ipcRenderer.send(RendererEvents.getFileContent().channel,props.selectedFilePath);
    },[props.selectedFilePath])

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.getFileContent().replyChannel,(e,lines:string[])=>{
            setState({lines});
        })
    },[])


    return <div onInput={(e)=> handleInput(e)} className="" contentEditable suppressContentEditableWarning={true}>              
        {state.lines.map((line,index)=> (<div key={index}>{line}</div>))}
    </div>
}

export const SelectedFile = React.memo(SelectedFileComponent);