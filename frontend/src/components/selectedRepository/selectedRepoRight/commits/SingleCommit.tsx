import { ICommitInfo } from "common_library";
import { UiUtils } from "../../../../lib";
import moment from "moment";
import React, { useRef } from "react";
import { FaCircle, FaDotCircle, FaEllipsisV, FaHashtag, FaKey, FaKeybase, FaKeycdn, FaUser } from "react-icons/fa";
import { ModalData } from "../../../modals/ModalData";

interface ISingleCommitProps{
    commit:ICommitInfo;
    isSelected:boolean;
    highlighted:boolean;
    onSelect:(commit:ICommitInfo)=>void;
    onRightClick:(e: React.MouseEvent<HTMLDivElement, MouseEvent>,commit:ICommitInfo)=>void;
}
interface IRefData{
    hoverElipsis:boolean;
}
function SingleCommitComponent(props:ISingleCommitProps){
    const refData = useRef<IRefData>({hoverElipsis:false});
    const getTimeZonOffsetStr = ()=>{
        return UiUtils.getTimeZonOffsetStr();
    }
    const handleEllipsisClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>)=>{
        //e.preventDefault(); 
        e.stopPropagation();        
        props.onRightClick(e as any,props.commit);
        // ModalData.commitContextModal.selectedCommit=props.commit!;            
        // ModalData.commitContextModal.position = {
        //     x:e.clientX,
        //     y:e.clientY,
        // };
        // UiUtils.openContextModal();        
    }
    const handleDivClick = ()=>{
        if(refData.current.hoverElipsis)
            return ;
        props.onSelect(props.commit);
    }
    return <div className={`py-1 w-100 overflow-auto ${props.isSelected?'selected':''} ${props.highlighted?'highlighted':''}`} onClick={()=>handleDivClick()} onContextMenu={e=>props.onRightClick(e,props.commit)}>
     <div className="border border-secondary ps-2">
        <div className="d-flex">
            <div className="flex-grow-1">
                <span><FaHashtag /> </span>
                <span>{props.commit.hash}</span>
                {!!props.commit.refs && 
                <b className="text-danger"> ({props.commit.refs})</b>}
            </div>
            
             {/* <span className="hover" onMouseEnter={()=> refData.current.hoverElipsis = true} 
              onMouseLeave={()=> refData.current.hoverElipsis = false} onClick={handleEllipsisClick}><FaEllipsisV /> </span> */}
        </div>        
        <div className="d-flex align-items-center">
            <span className="pe-2" style={{fontSize:'0.9em'}}><FaUser /> </span>
            <span>{props.commit.author_name}({props.commit.author_email}). </span>
            <span className="px-1" style={{fontSize:'0.5em'}}><FaCircle /> </span>
            <span title={getTimeZonOffsetStr()}>{moment(props.commit.date).format("MMMM Do YYYY, h:mm:ss a") }</span>
        </div>
        <div className="w-100 overflow-ellipsis">
            <span className="no-wrap" title={props.commit.message}>{props.commit.message}</span>
        </div>
    </div>
    </div>
}

export const SingleCommit = React.memo(SingleCommitComponent);