import React from "react";
import { Button, Form } from "react-bootstrap";
import {  UiUtils, useMultiState } from "../../../lib";
import {createRepositoryInfo, RendererEvents, StringUtils} from "common_library";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ActionSavedData } from "../../../store/slices";
import { GitUtils } from "../../../lib/utils/GitUtils";
import { IpcUtils } from "../../../lib/utils/IpcUtils";
import { AppButton } from "../../common";

function OpenRepoPanelComponent(){
    const [state,setState] = useMultiState({path:"",error:""});

    const handleOpen=()=>{       
        GitUtils.OpenRepository(state.path);
    }
    const handleBrowse=()=>{
        IpcUtils.browseFolderPath().then(r=>{
            if(r.result) setState({path:r.result,error:""});
        })
    }
    return <div className="d-flex flex-column align-items-center py-2">
        <div className="d-flex justify-content-center w-75">
            <Form.Control value={state.path} onChange={e=>setState({path:e.target.value,error:""})} placeholder="Enter path"></Form.Control>
            <span className="px-1"/>
            <AppButton type="success" className="text-white" onClick={handleOpen} disabled={!state.path}>Open</AppButton>
        </div>
        {!!state.error && <span className="text-danger">{state.error}</span>}
        <span>or</span>
        <div>
            <AppButton onClick={handleBrowse}>Browse</AppButton>
        </div>
    </div>
}

export const OpenRepoPanel = React.memo(OpenRepoPanelComponent);