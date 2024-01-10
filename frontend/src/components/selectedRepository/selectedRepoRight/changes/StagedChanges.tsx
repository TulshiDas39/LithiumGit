import { IChanges, IFile, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { Fragment, useEffect, useMemo, useRef } from "react";
import { FaAngleDown, FaAngleRight, FaMinus } from "react-icons/fa";
import { EnumChangesType, UiUtils, useMultiState } from "../../../../lib";

interface ISingleFileProps{
    fileName:string;
    filePath:string;
    handleSelect:(path:string)=>void;
    isSelected:boolean;
    handleUnstage:()=>void;
    changeType:"M"|"A"|"D";
}

function SingleFile(props:ISingleFileProps){
    const [state,setState]=useMultiState({isHovered:false})
    return (
        <div key={props.filePath} className={`row g-0 align-items-center flex-nowrap hover w-100 ${props.isSelected ? "selected":""}`} 
        title={props.fileName} onMouseEnter={()=> setState({isHovered:true})} onMouseLeave={_=> setState({isHovered:false})} 
            onClick={_=> props.handleSelect(props.filePath)}>
        <div className="col-auto overflow-hidden flex-shrink-1" style={{textOverflow:'ellipsis'}}>
            <span className={`pe-1 flex-shrink-0 ${props.changeType === "D"?"text-decoration-line-through":""}`}>{props.fileName}</span>
            <span className="small text-secondary">{props.filePath}</span>
        </div>
        
        <div className="col-auto align-items-center flex-nowrap overflow-hidden flex-grow-1 text-end pe-1">
            {state.isHovered && <Fragment>
                <span className="hover" title="Unstage" onClick={_=> props.handleUnstage()}><FaMinus /></span>                                    
            </Fragment>}
            <span>
                <span className="ps-1 text-success fw-bold">{props.changeType}</span>
            </span>
        </div>
    </div>
    )
}

interface IStagedChangesProps{
    changes:IChanges;    
    repoInfoInfo?:RepositoryInfo;
    onStatusChange:(status:IStatus)=>void;
    handleSelect:(path:string)=>void;
    selectedMode:EnumChangesType;
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


    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.unStageItem().replyChannel,(_,res:IStatus)=>{
            props.onStatusChange(res);
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.unStageItem().replyChannel]);
        }
    },[]);
    const headerRef = useRef<HTMLDivElement>();

    const fileListPanelHeight = useMemo(()=>{
        if(!headerRef.current)
            return props.height - 30;
        return props.height -headerRef.current.clientHeight;    
    },[headerRef.current?.clientHeight,props.height]);

    const totalItemCount = useMemo(()=>{
        const length = props.changes.created.length + props.changes.deleted.length
        + props.changes.modified.length;
        return length;
    },[props.changes])

    const handleUnstageItem = (item:IFile)=>{
        window.ipcRenderer.send(RendererEvents.unStageItem().channel,[item.path],props.repoInfoInfo)
    }

    const unStageAll=()=>{
        if(!totalItemCount) return;
        const paths = [...props.changes.created.map(_=>_.path),...props.changes.deleted.map(_=>_.path),
        ...props.changes.modified.map(_=>_.path)];
        window.ipcRenderer.send(RendererEvents.unStageItem().channel,paths,props.repoInfoInfo)
    }

    return <div style={{maxHeight:props.height}}>
    <div ref={headerRef as any} className="d-flex hover overflow-auto" onMouseEnter={_=> setState({isHeadHover:true})} onMouseLeave={_=> setState({isHeadHover:false})}
     >
        <div className="d-flex flex-grow-1" onClick={props.hanldeExpand}>
            <span>{props.isExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
            <span>Staged Changes</span>
            {!!totalItemCount && <span className="text-info">({totalItemCount})</span>}
        </div>        
        {state.isHeadHover && <div className="d-flex">            
            <span className="hover" title="UnStage all" onClick={_=> unStageAll()}><FaMinus /></span>
        </div>}
        
    </div>
    {props.isExpanded && 
    <div className="container ps-2 border" onMouseLeave={_=> setState({hoveredFile:undefined})}
    style={{maxHeight:`${fileListPanelHeight}px`, overflowX:'hidden',overflowY:'auto'}}>
        {props.changes?.modified?.map(f=>(
            <SingleFile key={f.path} fileName={f.fileName} filePath={f.
                path} handleSelect={_=> props.handleSelect(f.path)}
                handleUnstage={() => handleUnstageItem(f)}
                isSelected ={props.selectedMode === EnumChangesType.STAGED && f.path === props.selectedFilePath}
                changeType="M" />
        ))}
        {props.changes?.created?.map(f=>(
            <SingleFile key={f.path} fileName={f.fileName} filePath={f.
                path} handleSelect={_=> props.handleSelect(f.path)}
                handleUnstage={() => handleUnstageItem(f)}
                isSelected ={props.selectedMode === EnumChangesType.STAGED && f.path === props.selectedFilePath}
                changeType="A" />
        ))}
        {props.changes?.deleted?.map(f=>(
            <SingleFile key={f.path} fileName={f.fileName} filePath={f.
                path} handleSelect={_=> props.handleSelect(f.path)}
                handleUnstage={() => handleUnstageItem(f)}
                isSelected ={props.selectedMode === EnumChangesType.STAGED && f.path === props.selectedFilePath} 
                changeType="D"/>
        ))}
    </div>
    }
</div>
}

export const StagedChanges = React.memo(StagedChangesComponent);