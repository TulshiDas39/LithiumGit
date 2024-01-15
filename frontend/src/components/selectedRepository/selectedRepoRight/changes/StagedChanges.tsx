import { EnumChangeType, IChanges, IFile, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { Fragment, useEffect, useMemo, useRef } from "react";
import { FaAngleDown, FaAngleRight, FaMinus } from "react-icons/fa";
import { EnumChangeGroup, UiUtils, useMultiState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";

interface ISingleFileProps{
    item:IFile
    handleSelect:(path:string)=>void;
    isSelected:boolean;
    handleUnstage:()=>void;
}

function SingleFile(props:ISingleFileProps){
    const [state,setState]=useMultiState({isHovered:false})
    const getStatusText = ()=>{
        if(props.item.changeType === EnumChangeType.MODIFIED)
            return "M";
        if(props.item.changeType === EnumChangeType.CREATED)
            return "A";
        return "D";
    }
    return (
        <div key={props.item.path} className={`row g-0 align-items-center flex-nowrap hover w-100 ${props.isSelected ? "selected":""}`} 
        title={props.item.fileName} onMouseEnter={()=> setState({isHovered:true})} onMouseLeave={_=> setState({isHovered:false})} 
            onClick={_=> props.handleSelect(props.item.path)}>
        <div className="col-auto overflow-hidden flex-shrink-1" style={{textOverflow:'ellipsis'}}>
            <span className={`pe-1 flex-shrink-0 ${props.item.changeType === EnumChangeType.DELETED?"text-decoration-line-through":""}`}>{props.item.fileName}</span>
            <span className="small text-secondary">{props.item.path}</span>
        </div>
        
        <div className="col-auto align-items-center flex-nowrap overflow-hidden flex-grow-1 text-end pe-1">
            {state.isHovered && <Fragment>
                <span className="hover" title="Unstage" onClick={_=> props.handleUnstage()}><FaMinus /></span>                                    
            </Fragment>}
            <span>
                <span className="ps-1 text-success fw-bold">{getStatusText()}</span>
            </span>
        </div>
    </div>
    )
}

interface IStagedChangesProps{
    changes:IFile[];
    repoInfoInfo?:RepositoryInfo;    
    handleSelect:(file:IFile)=>void;
    selectedMode:EnumChangeGroup;
    selectedFilePath?:string;
    isExpanded:boolean;
    hanldeExpand:()=>void;
    height:number;
}

interface IState{
    // isStagedChangesExpanded:boolean;
    hoveredFile?:IFile;
    isHeadHover:boolean;
}

function StagedChangesComponent(props:IStagedChangesProps){
    const [state,setState] = useMultiState<IState>({isHeadHover:false});

    const headerRef = useRef<HTMLDivElement>();

    const fileListPanelHeight = useMemo(()=>{
        if(!headerRef.current)
            return props.height - 30;
        return props.height -headerRef.current.clientHeight;    
    },[headerRef.current?.clientHeight,props.height]);    

    const handleUnstageItem = (item:IFile)=>{
        IpcUtils.unstageItem([item.path],props.repoInfoInfo!);        
    }

    const unStageAll=()=>{
        if(!props.changes.length) return;
        IpcUtils.unstageItem(props.changes.map(_=>_.path),props.repoInfoInfo!);        
    }

    return <div style={{maxHeight:props.height}}>
    <div ref={headerRef as any} className="d-flex hover overflow-auto" onMouseEnter={_=> setState({isHeadHover:true})} onMouseLeave={_=> setState({isHeadHover:false})}
     >
        <div className="d-flex flex-grow-1" onClick={props.hanldeExpand}>
            <span>{props.isExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
            <span>Staged Changes</span>
            {!!props.changes.length && <span className="text-info">({props.changes.length})</span>}
        </div>        
        {state.isHeadHover && <div className="d-flex">            
            <span className="hover" title="UnStage all" onClick={_=> unStageAll()}><FaMinus /></span>
        </div>}
        
    </div>
    {props.isExpanded && 
    <div className="container ps-2 border" onMouseLeave={_=> setState({hoveredFile:undefined})}
    style={{maxHeight:`${fileListPanelHeight}px`, overflowX:'hidden',overflowY:'auto'}}>
        {props.changes.map(f=>(
            <SingleFile key={f.path} item={f} handleSelect={_=> props.handleSelect(f)}
                handleUnstage={() => handleUnstageItem(f)}
                isSelected ={props.selectedMode === EnumChangeGroup.STAGED && f.path === props.selectedFilePath}                />
        ))}        
    </div>
    }
</div>
}

export const StagedChanges = React.memo(StagedChangesComponent);