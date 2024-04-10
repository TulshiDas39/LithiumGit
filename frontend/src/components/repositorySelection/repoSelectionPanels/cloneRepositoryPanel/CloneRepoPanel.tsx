import React, { Fragment, useEffect, useRef } from "react"
import { Form, ProgressBar } from "react-bootstrap";
import { AppButton } from "../../../common";
import { UiUtils, useMultiState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { RendererEvents } from "common_library";
import { GitUtils } from "../../../../lib/utils/GitUtils";

enum CloneState{
    NotStarted,
    InProgress,
    Finished
}

enum FetchState{
    Remote="remote:",
    Receiving="receiving",
    Resolving="resolving"
}

interface IState{
    url:string;
    directory:string;
    cloningState:CloneState;
    progress:number;
    progressLabel:FetchState;
}

function CloneRepoPanelRepository(){
    const [state,setState] = useMultiState({directory:"",url:"",
    cloningState:CloneState.NotStarted,
    progressLabel:FetchState.Remote, progress:0} as IState);
    const refData = useRef({progress:0,stage: FetchState.Remote,timer: undefined! as NodeJS.Timeout});
    const cloneRepo = ()=>{        
        IpcUtils.cloneRepository(state.url,state.directory);
        setState({cloningState:CloneState.InProgress});
    }

    useEffect(()=>{
        if(state.cloningState === CloneState.InProgress){
            refData.current.timer = setInterval(()=>{
                let progress = 0;                
                if(refData.current.stage === FetchState.Resolving){
                    progress = 100;
                }
                else{
                    progress = refData.current.progress;
                }
                setState(state=>{
                    let cloningState = state.cloningState;
                    if(state.progressLabel === FetchState.Resolving && refData.current.progress === 100){            
                        cloningState = CloneState.Finished;
                    }
                    return {
                        ...state,
                        progress:progress,
                        progressLabel:refData.current.stage,
                        cloningState,
                    }
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
        window.ipcRenderer.on(RendererEvents.cloneProgress,(_e,progress:number,stage:FetchState)=>{            
            refData.current.stage = stage;
            refData.current.progress = progress;
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
    const showInFolder=()=>{
        IpcUtils.showInFileExplorer(state.directory);
    }

    const open=()=>{
        GitUtils.OpenRepository(state.directory);
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
                <Form.Control type="text" value={state.directory} readOnly={state.cloningState !== CloneState.NotStarted}
                    onChange={_=> setState({directory:_.target.value})} />
            </div>
            <div className="col-2">
                <div className="ps-1 h-100 d-flex">
                    {state.cloningState !== CloneState.Finished && <div className="h-100" style={{maxWidth:120}}>
                        <AppButton disabled={state.cloningState === CloneState.InProgress} className="w-100" text="Browse" type="success" style={{height:'100%',color:'white'}}
                        onClick={handleBrowse}  />
                    </div>}
                    {state.cloningState === CloneState.Finished && <div className="ps-2 h-100" style={{maxWidth:120}}>
                        <AppButton className="w-100" text="Show in Folder" type="success" style={{height:'100%',color:'white'}}
                        onClick={showInFolder}  />
                    </div>}
                </div>
            </div>
        </div>

        {state.cloningState === CloneState.NotStarted && <div className="d-flex justify-content-center pt-3">
              <AppButton text="Clone Repository" type="default" onClick={cloneRepo}/>
        </div>}
        {state.cloningState === CloneState.Finished && <div className="d-flex align-items-center justify-content-center">
            <div className="pe-2">Clone Complete</div>
            <div className="d-flex justify-content-center pt-3">
                <AppButton text="Open" type="default" onClick={open}/>
            </div>
        </div>}

        {state.cloningState === CloneState.InProgress && <Fragment>
            <div className="row g-0 py-5">
                <div className="col-1" />
                <div className="col-10">
                    <ProgressBar className="w-100" style={{height:20}} animated variant="success" now={state.progress} key={1}  label={`${state.progress}%`} />
                </div>            
            </div>
            <div className="text-center">{state.progressLabel === FetchState.Remote?"fetching":state.progressLabel}...</div>
        </Fragment>
        }
    </div>
}

export const CloneRepoPanel = React.memo(CloneRepoPanelRepository);