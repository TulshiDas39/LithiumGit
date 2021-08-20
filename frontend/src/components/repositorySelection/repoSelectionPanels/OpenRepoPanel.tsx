import React from "react";
import { Button, Form } from "react-bootstrap";
import {  UiUtils, useMultiState } from "../../../lib";
import {createRepositoryInfo, RendererEvents, StringUtils} from "common_library";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ActionSavedData } from "../../../store/slices";

function OpenRepoPanelComponent(){
    const [state,setState] = useMultiState({path:"",error:""});
    const dispatch = useDispatch();

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.getDirectoryPath().replyChannel,(e,path:string)=>{            
            if(!!path) setState({path,error:""});
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getDirectoryPath().replyChannel]);
        }
    },[])
    const handleOpen=()=>{
        const isValidPath = window.ipcRenderer.sendSync(RendererEvents.isValidRepoPath,state.path);
        console.log("isValidPath",isValidPath);
        if(!isValidPath) setState({error:"The path is not a git repository"});
        else {
            const newRepoInfo = createRepositoryInfo({
                name:StringUtils.getFolderName(state.path),
                path:state.path
            });
            dispatch(ActionSavedData.setSelectedRepository(newRepoInfo));
        }
    }
    const handleBrowse=()=>{
        window.ipcRenderer.send(RendererEvents.getDirectoryPath().channel);        
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