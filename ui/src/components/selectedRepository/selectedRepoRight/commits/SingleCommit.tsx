import { ICommitInfo } from "common_library";
import { EnumSelectedRepoTab, GraphUtils, RepoUtils, UiUtils, useMultiState } from "../../../../lib";
import moment from "moment";
import React, { useRef } from "react";
import { FaCircle, FaDotCircle, FaEllipsisV, FaHashtag, FaKey, FaKeybase, FaKeycdn, FaUser } from "react-icons/fa";
import { ModalData } from "../../../modals/ModalData";
import { Dropdown } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { ActionUI } from "../../../../store/slices/UiSlice";

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

interface IState{
    showDropdown:boolean;
}
function SingleCommitComponent(props:ISingleCommitProps){
    const [state,setState] = useMultiState<IState>({showDropdown:false});
    const refData = useRef<IRefData>({hoverElipsis:false});
    const getTimeZonOffsetStr = ()=>{
        return UiUtils.getTimeZonOffsetStr();
    }
    const dispatch = useDispatch();
    const handleDivClick = ()=>{
        if(refData.current.hoverElipsis)
            return ;
        props.onSelect(props.commit);
    }
    const handleContext = (e: React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        if(refData.current.hoverElipsis)
            return ;
        props.onRightClick(e,props.commit);
    }

    const showInGraph=()=>{
        const commit = RepoUtils.repositoryDetails.allCommits.find(c=>c.hash === props.commit.hash);
        if(commit){
            dispatch(ActionUI.setSelectedRepoTab(EnumSelectedRepoTab.GRAPH));
            GraphUtils.state.selectedCommit.publish(commit);
            GraphUtils.state.selectedCommit.focus();
        }
    }

    return <div className={`py-1 w-100 overflow-hidden ${props.isSelected?'selected':''} ${props.highlighted?'highlighted':''}`} onClick={()=>handleDivClick()} onContextMenu={handleContext}>
     <div className="border border-secondary ps-2">
        <div className="d-flex">
            <div className="flex-grow-1">
                <span><FaHashtag /> </span>
                <span>{props.commit.hash}</span>
                {!!props.commit.refs && 
                <b className="text-danger"> ({props.commit.refs})</b>}
            </div>
            <div className="d-flex justify-content-end align-items-center">            
                <Dropdown className="pe-2"
                onMouseEnter={()=> refData.current.hoverElipsis = true} onMouseLeave={()=> refData.current.hoverElipsis = false}>
                    <Dropdown.Toggle variant="link" id="dropdown-commit-list-item" className="rounded-0 no-caret">
                        <FaEllipsisV />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="no-radius">
                        <Dropdown.Item key={"show_in_graph"} onClick={showInGraph} className="border-bottom">Show in graph</Dropdown.Item>                                
                    </Dropdown.Menu>
                </Dropdown>                        
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