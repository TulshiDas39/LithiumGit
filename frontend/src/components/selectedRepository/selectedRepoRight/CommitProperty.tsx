import { ICommitInfo } from "common_library";
import React from "react"

interface ICommitProperty{
    selectedCommit?:ICommitInfo;
}

function CommitPropertyComponent(props:ICommitProperty){
    if(!props.selectedCommit) return null;
    return <div id="commit_property" className="d-flex flex-column">
        <h6>Commit properties</h6>
        <span>Sha: {props.selectedCommit.avrebHash}</span>
        
    </div>
}

export const CommitProperty = React.memo(CommitPropertyComponent);