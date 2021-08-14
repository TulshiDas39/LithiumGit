import React from "react";
import { Button, Form } from "react-bootstrap";
import { useMultiState } from "../../../lib";
import {RendererEvents} from "common_library";

function OpenRepoPanelComponent(){
    const [state,setState] = useMultiState({path:"",error:""});
    const handleOpen=()=>{
        const isValidPath = window.ipcRenderer.sendSync(RendererEvents.isValidRepoPath,state.path);
        console.log("isValidPath",isValidPath);
        if(!isValidPath) setState({error:"The path is not a git repository"});        
    }
    const handleBrowse=()=>{
        window.ipcRenderer.send(RendererEvents.getDirectoryPath().channel);
        window.ipcRenderer.on(RendererEvents.getDirectoryPath().replyChannel,(e,path:string)=>{
            console.log("path",path);
            if(!!path) setState({path});
        });
    }
    return <div className="d-flex flex-column align-items-center py-2">
        <div className="d-flex justify-content-center w-75">
            <Form.Control value={state.path} onChange={e=>setState({path:e.target.value,error:""})} placeholder="Enter path"></Form.Control>
            <span className="px-1"/>
            <Button onClick={handleOpen} disabled={!state.path}>Open</Button>
        </div>
        {!!state.error && <span className="text-danger">{state.error}</span>}
        <span>or</span>
        <div>
            <Button onClick={handleBrowse}>Browse</Button>
        </div>
    </div>
}

export const OpenRepoPanel = React.memo(OpenRepoPanelComponent);