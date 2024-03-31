import { RendererEvents } from "common_library";
import React, { useEffect, useRef  } from "react"
import { Form } from "react-bootstrap";
import { FaCheck } from "react-icons/fa";
import { shallowEqual, useDispatch } from "react-redux";
import { BranchUtils, UiUtils, useMultiState } from "../../../../lib";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { StringUtils } from "../../../../lib/utils/StringUtils";

interface IState{
    value:string;
    amend:boolean;
}

function CommitBoxComponent(){
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

    const [state,setState]= useMultiState({value:"",autoStatingEnabled:store.autoStagingEnabled,amend:false} as IState);

    const handleCommit=()=>{
        const options:string[] = [];
        if(state.amend)
            options.push("--amend");
        const messages = new StringUtils().getLines(state.value);        
        IpcUtils.doCommit(messages,options).finally(()=>{
            setState({value:""});
            IpcUtils.getRepoStatus();
        })
        
    }

    useEffect(()=>{
        if(store.isMergingState){            
            setState({value:BranchUtils.generateMergeCommit()});
        }        
    },[store.isMergingState])

    useEffect(()=>{
        if(!state.amend || !!state.value)
            return;
        const headCommit = BranchUtils.repositoryDetails.headCommit;
        setState({value:headCommit.message});
    },[state.amend])

    

    return <div className="w-100 pb-2" ref={ref as any}>
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
            <div className="d-flex align-items-center justify-content-center pt-1">
                <input id="amend" type="checkbox" className="m-0" checked={state.amend} onChange={_=>setState({amend: _.target.checked})} />
                <label htmlFor="amend" className="ps-1">Amend</label>
            </div>
    </div>
}

export const CommitBox = React.memo(CommitBoxComponent);