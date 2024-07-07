import { ICommitInfo } from "common_library";
import moment from "moment";
import React, { useEffect, useMemo } from "react"
import { UiUtils, useMultiState } from "../../../../lib";
import { GraphUtils } from "../../../../lib/utils/GraphUtils";
import { InputText } from "../../../common";
import { FaCopy } from "react-icons/fa";
import { copy } from "fs-extra";

interface IState{
    selectedCommit?:ICommitInfo;
}

function CommitPropertyComponent(){
    const [state,setState]=useMultiState({} as IState);

    useEffect(()=>{        
        const selectListener = (commit:ICommitInfo)=>{
            setState({selectedCommit:commit});
        }
        GraphUtils.state.selectedCommit.subscribe(selectListener);
        return ()=>{
            GraphUtils.state.selectedCommit.unSubscribe(selectListener);
        }
    },[])
    const textFieldValue = useMemo(()=>{
        let value = state.selectedCommit?.message;
        if(state.selectedCommit?.body){
            value += "\n\n"+state.selectedCommit?.body;
        }
        return value;
    },[state.selectedCommit?.message,state.selectedCommit?.body])

    const handleCopy = ()=>{
        UiUtils.copy(state.selectedCommit?.hash!);
    }

    if(!state.selectedCommit) return null;
    return <div id="commit_property" className="d-flex flex-column w-100 ps-1 overflow-hidden border">
        <b>Commit properties</b>
        {!!state.selectedCommit.hash && <span className="d-flex align-items-center">
            <span>Sha: {state.selectedCommit.avrebHash}</span> 
            <span title="Copy" className="ps-2 d-flex align-items-center hover click-effect" onClick={() => handleCopy()}><FaCopy className="click-effect" /> </span>
        </span>}
        <span>Date: {moment(state.selectedCommit.date).format("D MMM,YYYY hh:mm a") }</span>
        {!!state.selectedCommit.hash && <div className="w-100 overflow-hidden d-flex">
            <span>Author: </span>
            <div><InputText text={state.selectedCommit.author_name}/></div>
            <span>&lt;</span>            
            <div><InputText text={state.selectedCommit.author_email} /></div>
            <span>&gt;</span>
        </div>}
        {/* <span className="w-100 overflow-hidden d-flex">Author: <InputText text={props.selectedCommit.author_name}/> &lt;<InputText text={props.selectedCommit.author_email} />&gt;</span> */}
        <div className="">
            <textarea name="message" rows={8} className="no-resize w-75" 
                value={textFieldValue} onChange={_=>{}} />            
        </div>
    </div>
}

export const CommitProperty = React.memo(CommitPropertyComponent);