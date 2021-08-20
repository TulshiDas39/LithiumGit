import { ICommitInfo } from "common_library";
import moment from "moment";
import React from "react"
import { InputText } from "../../common";

interface ICommitProperty{
    selectedCommit?:ICommitInfo;
}

function CommitPropertyComponent(props:ICommitProperty){
    if(!props.selectedCommit) return null;
    return <div id="commit_property" className="d-flex flex-column w-100 ps-1 overflow-hidden border">
        <h6>Commit properties</h6>
        <span>Sha: {props.selectedCommit.avrebHash}</span>
        <span>Date: {moment(props.selectedCommit.date).format("D MMM,YYYY") }</span>
        <div className="w-100 overflow-hidden d-flex">
            <span>Author: </span>
            <div><InputText text={props.selectedCommit.author_name}/></div>
            <span>&lt;</span>            
            <div><InputText text={props.selectedCommit.author_email} /></div>
            <span>&gt;</span>
        </div>
        {/* <span className="w-100 overflow-hidden d-flex">Author: <InputText text={props.selectedCommit.author_name}/> &lt;<InputText text={props.selectedCommit.author_email} />&gt;</span> */}
        <div className="">
            <textarea name="message" rows={8} className="no-resize w-75" 
                value={props.selectedCommit.message} onChange={_=>{}} />            
        </div>
    </div>
}

export const CommitProperty = React.memo(CommitPropertyComponent);