import { ICommitInfo } from "common_library";
import moment from "moment";
import React, { useMemo } from "react"
import { ReduxUtils, UiUtils } from "../../../../lib";
import { InputText } from "../../../common";
import { FaCopy } from "react-icons/fa";
import { ModalData } from "../../../modals/ModalData";
import { ActionModals } from "../../../../store";

interface IProps{
    selectedCommit?:ICommitInfo;
}


function CommitPropertyComponent(props:IProps){

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
        {/* <span className="w-100 overflow-hidden d-flex">Author: <InputText text={props.selectedCommit.author_name}/> &lt;<InputText text={props.selectedCommit.author_email} />&gt;</span> */}
        <div className="">
            <textarea name="message" rows={8} className="no-resize w-75" 
                value={textFieldValue} onChange={_=>{}} />            
        </div>
    </div>
}

export const CommitProperty = React.memo(CommitPropertyComponent);