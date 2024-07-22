import { ICommitInfo } from "common_library";
import { UiUtils } from "../../../../lib";
import moment from "moment";
import React from "react";

interface ISingleCommitProps{
    commit:ICommitInfo;
    isSelected:boolean;
    onSelect:(commit:ICommitInfo)=>void;
}

function SingleCommitComponent(props:ISingleCommitProps){
    const getTimeZonOffsetStr = ()=>{
        return UiUtils.getTimeZonOffsetStr();
    }
    return <div className={`py-1 w-100 overflow-auto ${props.isSelected?'selected':''}`} onClick={()=>props.onSelect(props.commit)}>
     <div className="border border-primary ps-2">
        <div>
            <span>Sha: </span>
            <span>{props.commit.hash}</span>
            {!!props.commit.refs && 
             <b className="text-danger"> ({props.commit.refs})</b>}
        </div>
        <div>
            <span>Date: </span>
            <span title={getTimeZonOffsetStr()}>{moment(props.commit.date).format("MMMM Do YYYY, h:mm:ss a") }</span>
        </div>
        <div>
            <span>Author: </span>
            <span>{props.commit.author_name}({props.commit.author_email})</span>
        </div>
        <div>
            <span>Message: </span>
            <span>{props.commit.message}</span>
        </div>
    </div>
    </div>
}

export const SingleCommit = React.memo(SingleCommitComponent);