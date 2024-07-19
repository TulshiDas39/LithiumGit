import { RendererEvents, StringUtils } from "common_library";
import React, { useEffect, useRef  } from "react"
import { Form } from "react-bootstrap";
import { FaCaretDown, FaCheck } from "react-icons/fa";
import { shallowEqual, useDispatch } from "react-redux";
import { RepoUtils, UiUtils, useMultiState } from "../../../../lib";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { AppButton } from "../../../common";
import { GitUtils } from "../../../../lib/utils/GitUtils";

interface IState{
    value:string;
    amend:boolean;
    showStash:boolean;
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

        const handler = ()=>{
            if(!refData.current.onHoverStash){
                setState({showStash:false})    
            }                      
        }
        
        document.addEventListener("click",handler);   

        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.commit().replyChannel],[commitReplyLisenter]);
            document.removeEventListener("click",handler);
        }
    },[])

    const refData = useRef({onHoverStash:false});
    const ref = useRef<HTMLDivElement>();

    const [state,setState]= useMultiState<IState>({
        value:"",
        amend:false,
        showStash:false,
    });

    const handleCommit=()=>{
        const options:string[] = [];
        if(state.amend)
            options.push("--amend");
        const messages = StringUtils.getLines(state.value);        
        IpcUtils.doCommit(messages,options).then(r=>{
            if(!r.error){
                if(state.amend)
                    setState({amend:false});
            }
        }).finally(()=>{
            setState({value:""});
            GitUtils.getStatus();
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

    const handleStashCaretClick=()=>{        
        setState({showStash:!state.showStash});
    }
    
    const handleStash = ()=>{
        setState({showStash:false,value:""});
        const options = ["-u"];
        if(state.value)
            options.push("-m",state.value);
        IpcUtils.runStash(options).then(()=>{
            GitUtils.getStatus();
        })
    }

    return <div className="w-100 pb-2 d-flex flex-column" style={{height:116}}>
            <div className="col">
                <Form.Control as="textarea" rows={2} value={state.value} onChange={e => setState({value:e.target.value})} onKeyUp={e=> {if (e.key === 'Enter' ) e.preventDefault(); }}        
                    type="textarea" className="w-100 h-100 rounded-0 no-resize bg-color" placeholder="Commit message" />
            </div>
            
            <div className="col d-flex pt-1">
                <div className="row w-100 h-100 g-0 justify-content-center flex-nowrap">  
                    <div className="col-3 pe-1"></div>
                    <div className="col-6">
                        <div className="row g-0 flex-nowrap">
                            <div className="col-auto">
                                <AppButton type="success" onClick={handleCommit} className="h-100 py-2">
                                    <span className="pe-2">
                                        <FaCheck className="ps-2 h5 m-0"/>
                                    </span>
                                    <span className="">Commit</span>                    
                                </AppButton>
                            </div>
                            <div className="border-secondary border-start border-end col-auto d-flex position-relative" 
                                onMouseEnter={()=> {refData.current.onHoverStash = true}} onMouseLeave={()=>{refData.current.onHoverStash = false}}>
                                <AppButton type="success" className="" style={{width:15,paddingLeft:'2px', paddingRight:'2px'}}
                                    onClick={()=>handleStashCaretClick()}>
                                    <FaCaretDown />
                                </AppButton>
                                {state.showStash && <div className="position-absolute bg-success py-2 px-2 button-effect" style={{top:'105%', right:0}}
                                    onClick={()=>handleStash()}>
                                    <span className="text-nowrap text-light">Stash all</span>
                                </div>}                    
                            </div>
                            
                        </div>
                        
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