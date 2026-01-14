import { IStash } from "common_library";
import {moment} from "common_library";
import React, { useMemo } from "react"
import { InputText } from "../../../common";

interface IProps{
    stash:IStash;
}

function StashPropertyComponent(props:IProps){

    const textFieldValue = useMemo(()=>{
        let value = props.stash?.message;
        if(props.stash.body){
            value += "\n\n"+props.stash.body;
        }
        return value;
    },[props.stash.message,props.stash.body])

    if(!props.stash)
        return null;
    return <div id="commit_property" className="d-flex flex-column w-100 ps-1 overflow-hidden border">
        <b>Stash properties</b>
        {!!props.stash.hash && <span>Sha: {props.stash.avrebHash}</span>}
        <span>Date: {moment(props.stash.date).format("D MMM,YYYY hh:mm a") }</span>
        {!!props.stash.hash && <div className="w-100 overflow-hidden d-flex">
            <span>Author: </span>
            <div><InputText text={props.stash.authorName}/></div>
            <span>&lt;</span>            
            <div><InputText text={props.stash.authEmail} /></div>
            <span>&gt;</span>
        </div>}
        {/* <span className="w-100 overflow-hidden d-flex">Author: <InputText text={props.selectedCommit.author_name}/> &lt;<InputText text={props.selectedCommit.author_email} />&gt;</span> */}
        <div className="">
            <textarea name="message" rows={8} className="no-resize w-75" 
                value={textFieldValue} onChange={_=>{}} />            
        </div>
    </div>
}

export const StashProperty = React.memo(StashPropertyComponent);