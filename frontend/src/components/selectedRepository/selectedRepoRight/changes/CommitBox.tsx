import { RendererEvents, StringUtils } from "common_library";
import React, { useEffect, useRef  } from "react"
import { Form } from "react-bootstrap";
import { FaCheck } from "react-icons/fa";
import { shallowEqual, useDispatch } from "react-redux";
import { RepoUtils, UiUtils, useMultiState } from "../../../../lib";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { AppButton } from "../../../common";

interface IState{
    value:string;
    amend:boolean;
}

function CommitBoxComponent(){
    const store = useSelectorTyped(state=>({
        autoStagingEnabled:state.savedData.autoStagingEnabled,
        isMergingState:!!state.ui.status?.mergingCommitHash,
        repoPath:state.savedData?.recentRepositories.find(_=> _.isSelected)?.path,
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
        const messages = StringUtils.getLines(state.value);        
        IpcUtils.doCommit(messages,options).finally(()=>{
            setState({value:""});
            IpcUtils.getRepoStatus();
        })
        
    }

    useEffect(()=>{
        if(store.isMergingState){            
            setState({value:RepoUtils.generateMergeCommit()});
        }
        else{
            setState({value:""});
        }
    },[store.isMergingState,store.repoPath])

    useEffect(()=>{
        if(!state.amend || !!state.value)
            return;
        const headCommit = RepoUtils.repositoryDetails.headCommit;
        let msg  = headCommit.message;
        if(headCommit.body){
            msg += `\n${headCommit.body}`;
        }

        setState({value:msg});
    },[state.amend])

    

    return <div className="w-100 pb-2 d-flex flex-column" style={{height:116}}>
            <div className="col">
                <Form.Control as="textarea" rows={2} value={state.value} onChange={e => setState({value:e.target.value})} onKeyUp={e=> {if (e.key === 'Enter' ) e.preventDefault(); }}        
                    type="textarea" className="w-100 h-100 rounded-0 no-resize" placeholder="Commit message" />
            </div>
            
            <div className="col d-flex pt-1">
                <div className="row w-100 h-100 g-0 justify-content-center flex-nowrap overflow-hidden">  
                    <div className="col-3 pe-1"></div>
                    <div className="col-6">
                        <AppButton type="success" onClick={handleCommit} className="h-100">
                            <span className="pe-2">
                                <FaCheck className="ps-2 h5 m-0"/>
                            </span>
                            <span className="">Commit</span>                    
                        </AppButton>
                    </div>                    
                    <div className="col-3"></div>
                </div>                
            </div>
            <div className="col-auto">
                <div className="d-flex align-items-center justify-content-center pt-1">
                    <input id="amend" type="checkbox" className="m-0" checked={state.amend} onChange={_=>setState({amend: _.target.checked})} />
                    <label htmlFor="amend" className="ps-1">Amend</label>
                </div>
            </div>                        
    </div>
}

export const CommitBox = React.memo(CommitBoxComponent);