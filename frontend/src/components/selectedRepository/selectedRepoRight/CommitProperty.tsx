import { ICommitInfo } from "common_library";
import moment from "moment";
import React from "react"

interface ICommitProperty{
    selectedCommit?:ICommitInfo;
}

function CommitPropertyComponent(props:ICommitProperty){
    if(!props.selectedCommit) return null;
    return <div id="commit_property" className="d-flex flex-column w-100 overflow-hidden border">
        <h6>Commit properties</h6>
        <span>Sha: {props.selectedCommit.avrebHash}</span>
        <span>Date: {moment(props.selectedCommit.date).format("D MMM,YYYY") }</span>
        <span>Author: {props.selectedCommit.author_name}&lt;{props.selectedCommit.author_email}&gt;</span>
        <div className="ps-5">
            <textarea name="message" rows={8} className="no-resize w-75" 
                value={props.selectedCommit.message} />            
        </div>
    </div>
}

export const CommitProperty = React.memo(CommitPropertyComponent);