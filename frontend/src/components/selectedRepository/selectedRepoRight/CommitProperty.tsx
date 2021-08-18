import { ICommitInfo } from "common_library";
import React from "react"

interface ICommitProperty{
    selectedCommit?:ICommitInfo;
}

function CommitPropertyComponent(props:ICommitProperty){
    return <div id="commit_property" className="">
        
    </div>
}

export const CommitProperty = React.memo(CommitPropertyComponent);