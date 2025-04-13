import { ICommitInfo, StringUtils } from "common_library";
import moment from "moment";
import React, { useEffect, useMemo } from "react"
import { ReduxUtils, UiUtils, useMultiState } from "../../../../lib";
import { InputText } from "../../../common";
import { FaCopy } from "react-icons/fa";
import { ModalData } from "../../../modals/ModalData";
import { ActionModals } from "../../../../store";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";

interface IProps{
    selectedCommit?:ICommitInfo;
}

interface IState{
    branches:string[];
}
function CommitPropertyComponent(props:IProps){

    const [state,setState]=useMultiState<IState>({branches:[]});

    const textFieldValue = useMemo(()=>{
        let value = props.selectedCommit?.message;
        if(props.selectedCommit?.body){
            value += "\n\n"+props.selectedCommit?.body;
        }
        return value;
    },[props.selectedCommit?.message,props.selectedCommit?.body])

    const handleCopy = ()=>{
        UiUtils.copy(props.selectedCommit?.hash!);
        ModalData.appToast.message = "Copied.";
        ReduxUtils.dispatch(ActionModals.showToast());
    }

    const timeZoneOffset = useMemo(()=>{
        return UiUtils.getTimeZonOffsetStr();
    },[]);

    useEffect(()=>{
        if(!props.selectedCommit)
            return;
        IpcUtils.getCommitInfo(props.selectedCommit?.hash).then(r=>{
            if(r.result){
                const displayList = StringUtils.removeRemotePrefix(r.result.containingBranches);
                setState({branches:displayList});
            }
        });
    },[props.selectedCommit])

    const branchesStr = useMemo(()=>{
        const str = state.branches.join();
        return str;
    },[state.branches])

    if(!props.selectedCommit) return null;
    return <div id="commit_property" className="d-flex flex-column w-100 ps-1 overflow-hidden border">
        <b>Commit properties</b>
        {!!props.selectedCommit.hash && <span className="d-flex align-items-center">
            <span>Sha: {props.selectedCommit.avrebHash}</span> 
            <span title="Copy" className="ps-2 d-flex align-items-center hover click-effect" onClick={() => handleCopy()}><FaCopy className="click-effect" /> </span>
        </span>}
        <span title={timeZoneOffset}>Date: {moment(props.selectedCommit.date).format("D MMM,YYYY hh:mm a") }</span>
        {!!props.selectedCommit.hash && <div className="w-100 overflow-hidden d-flex">
            <span>Author: </span>
            <div><InputText text={props.selectedCommit.author_name}/></div>
            <span>&lt;</span>            
            <div><InputText text={props.selectedCommit.author_email} /></div>
            <span>&gt;</span>
        </div>}
        <div className="w-100 overflow-hidden d-flex">
            <div style={{width:'65px'}}>Branches: </div>
            <div style={{width:'calc(100% - 65px)'}} className="overflow-hidden"><InputText text={branchesStr} width={(branchesStr.length+2)+"ch"} /></div>            
        </div>
        {/* <span className="w-100 overflow-hidden d-flex">Author: <InputText text={props.selectedCommit.author_name}/> &lt;<InputText text={props.selectedCommit.author_email} />&gt;</span> */}
        <div className="">
            <textarea name="message" rows={8} className="no-resize w-75" 
                value={textFieldValue} onChange={_=>{}} />            
        </div>
    </div>
}

export const CommitProperty = React.memo(CommitPropertyComponent);