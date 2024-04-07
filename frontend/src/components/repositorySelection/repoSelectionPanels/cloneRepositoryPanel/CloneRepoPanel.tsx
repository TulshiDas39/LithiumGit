import React, { useEffect, useRef } from "react"
import { Form, ProgressBar } from "react-bootstrap";
import { AppButton } from "../../../common";
import { UiUtils, useMultiState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { RendererEvents } from "common_library";

enum CloneState{
    NotStarted,
    InProgress,
    Finished
}

interface IState{
    url:string;
    directory:string;
    cloningState:CloneState;
    progress:number;
    progressLabel:string;
}

function CloneRepoPanelRepository(){
    const [state,setState] = useMultiState({directory:"",url:"",cloningState:CloneState.NotStarted} as IState);
    const refData = useRef({progress:0,stage:"Resolving",timer: undefined! as NodeJS.Timeout});
    const cloneRepo = ()=>{        
        IpcUtils.cloneRepository(state.url,state.directory);
        setState({cloningState:CloneState.InProgress});
    }

    useEffect(()=>{
        if(state.cloningState === CloneState.InProgress){
            refData.current.timer = setInterval(()=>{
                setState({
                    progress:refData.current.progress,
                    progressLabel:refData.current.stage
                });
            },500);
        }
        else if(state.cloningState === CloneState.Finished){
            clearInterval(refData.current.timer);
            refData.current.timer = null!;            
        }
        else{
            //setState({})
        }
    },[state.cloningState])
    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.cloneProgress,(_e,progress:number,stage:string)=>{
            console.log("stage",stage);
            refData.current.progress = progress;
            refData.current.stage = stage;
        })

        window.ipcRenderer.on(RendererEvents.getDirectoryPath().replyChannel,(e,path:string)=>{            
            if(!!path) setState({directory:path});
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getDirectoryPath().replyChannel]);
        }
    },[])
    const handleBrowse=()=>{
        window.ipcRenderer.send(RendererEvents.getDirectoryPath().channel);        
    }
    return <div>
        <div className="text-center">
            <h2>Clone Repository</h2>
        </div>
        <div className="row g-0">
            <div className="col-2 d-flex align-items-center justify-content-end">                
                <span>URL: </span>
            </div>
            <div className="col-8">
                <Form.Control type="text" value={state.url} onChange={_=>setState({url:_.target.value})} />
            </div>                        
        </div>

        <div className="row g-0 pt-2">
            <div className="col-2 d-flex align-items-center justify-content-end">                
                <span>Directory Path: </span>
            </div>
            <div className="col-8">
                <Form.Control type="text" value={state.directory} onChange={_=> setState({directory:_.target.value})} />
            </div>
            <div className="col-2">
                <div className="ps-1 h-100">
                    <AppButton className="" text="Browse" type="success" style={{maxWidth:120,height:'100%',color:'white'}}
                    onClick={handleBrowse}  />
                </div>
            </div>
        </div>

        {state.cloningState === CloneState.NotStarted && <div className="d-flex justify-content-center pt-3">
              <AppButton text="Clone Repository" type="default" onClick={cloneRepo}/>
        </div>}

        {state.cloningState === CloneState.InProgress && <div className="row g-0 py-5">
            <div className="col-1" />
            <div className="col-10">
                <ProgressBar className="w-100" style={{height:20}} animated variant="success" now={state.progress} key={1}  label={`${state.progress}%`} />
            </div>            
        </div>}
    </div>
}

export const CloneRepoPanel = React.memo(CloneRepoPanelRepository);