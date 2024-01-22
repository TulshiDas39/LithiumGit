import { RendererEvents } from "common_library";
import React, { useEffect, useRef  } from "react"
import { Form } from "react-bootstrap";
import { FaCheck } from "react-icons/fa";
import { shallowEqual, useDispatch } from "react-redux";
import { BranchUtils, UiUtils, useMultiState } from "../../../../lib";
import { ActionSavedData } from "../../../../store";
import { useSelectorTyped } from "../../../../store/rootReducer";

interface ICommitBoxProps{
    //onHeightChange:(height:number)=>void;
}

interface IState{
    value:string;
    autoStatingEnabled:boolean;
}

function CommitBoxComponent(props:ICommitBoxProps){
    const store = useSelectorTyped(state=>({
        autoStagingEnabled:state.savedData.autoStagingEnabled,
        isMergingState:!!state.ui.status?.mergingCommitHash
    }),shallowEqual);
    const dispatch = useDispatch();

    useEffect(()=>{
        const commitReplyLisenter = ()=>{
            setState({value:""});
        }
        window.ipcRenderer.on(RendererEvents.commit().replyChannel,commitReplyLisenter);

        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.commit().replyChannel],[commitReplyLisenter]);
        }
    },[])

    const ref = useRef<HTMLDivElement>();

    useEffect(()=>{
        // if(ref.current?.clientHeight)
        //     props.onHeightChange(ref.current.clientHeight);

    },[ref.current?.clientHeight])

    const [state,setState]= useMultiState({value:"",autoStatingEnabled:store.autoStagingEnabled} as IState);
    useEffect(()=>{
        setState({autoStatingEnabled:store.autoStagingEnabled});
    },[store.autoStagingEnabled]);

    const handleCommit=()=>{
        window.ipcRenderer.send(RendererEvents.commit().channel,BranchUtils.repositoryDetails.repoInfo,state.value);
    }
    const handleAutoStageClick=()=>{
        window.ipcRenderer.sendSync(RendererEvents.updateAutoStaging().channel,!state.autoStatingEnabled);                
        dispatch(ActionSavedData.updateAutoStaging(!state.autoStatingEnabled));
    }

    useEffect(()=>{
        if(store.isMergingState){            
            setState({value:BranchUtils.generateMergeCommit()});
        }        
    },[store.isMergingState])

    

    return <div className="w-100" ref={ref as any}>
            <Form.Control as="textarea" rows={2} value={state.value} onChange={e=> setState({value:e.target.value})} onKeyUp={e=> {if (e.key === 'Enter' ) e.preventDefault(); }}        
                type="textarea" className="w-100 rounded-0 no-resize" placeholder="Commit message" />
            <div className="row g-0 align-items-center pt-2 justify-content-center flex-nowrap overflow-hidden">  
                <div className="col-3 pe-1"></div>              
                <div className="col-6 d-flex bg-success cur-point overflow-hidden" onClick={handleCommit}>
                    <div className="row g-0 align-items-center py-2 w-100">
                        <div className="col-4 text-end pe-2">
                            <FaCheck className="ps-2 h5 m-0"/>
                        </div>
                        <div className="col-8">
                            <span className="">Commit</span> 
                        </div>
                    </div>
                </div>
                <div className="col-3"></div>
            </div>
            <div className="row g-0 border-bottom pb-2 justify-content-center flex-nowrap overflow-hidden">
                <div className="col-auto ps-1">
                    <Form.Check id="auto_stage" checked={state.autoStatingEnabled} onChange={handleAutoStageClick} />
                </div>
                <div className="col-auto ps-1">
                    <label htmlFor="auto_stage" className="small no-wrap">Automatically Stage all</label>
                </div>
            </div>
    </div>
}

export const CommitBox = React.memo(CommitBoxComponent);