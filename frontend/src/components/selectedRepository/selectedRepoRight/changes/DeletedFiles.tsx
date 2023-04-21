import { IFile, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { useEffect, useMemo, useRef } from "react"
import { FaAngleDown, FaAngleRight, FaUndo, FaPlus } from "react-icons/fa";
import { useMultiState } from "../../../../lib";

interface IDeletedFilesProps{
    files?:IFile[];
    repoInfoInfo?:RepositoryInfo;
    onStatusChange:(status:IStatus)=>void;
    onFileSelect:(path:string)=>void;
    handleExpand:()=>void;
    height:number;
    isExpanded:boolean;
}

interface IState{
    hoveredFile?:IFile;
    isHeadHover:boolean;
}


function DeletedFilesComponent(props:IDeletedFilesProps){
    const [state,setState] = useMultiState<IState>({
        isHeadHover:false});

    const headerRef = useRef<HTMLDivElement>();
    
    const fileListPanelHeight = useMemo(()=>{
        if(!headerRef.current)
            return props.height - 30;
        return props.height -headerRef.current.clientHeight;    
    },[headerRef.current?.clientHeight,props.height]);

    useEffect(()=>{
        //props.handleExpand();
    },[props.isExpanded,props.files]) 
    
    const handleChangesCollapse = () => {
        props.handleExpand();
    }

    const handleStage=(file:IFile)=>{
        window.ipcRenderer.send(RendererEvents.stageItem().channel,[file.path],props.repoInfoInfo);
    }

    const stageAll=()=>{
        if(!props.files?.length) return;
        window.ipcRenderer.send(RendererEvents.stageItem().channel,props.files?.map(x=>x.path),props.repoInfoInfo);
    }

    const discardUnstagedChangesOfItem=(item:IFile)=>{
        window.ipcRenderer.send(RendererEvents.discardItem().channel,[item.path],props.repoInfoInfo);
    }

    const discardAll=()=>{
        if(!props.files?.length) return;
        window.ipcRenderer.send(RendererEvents.discardItem().channel,props.files.map(x=>x.path),props.repoInfoInfo);
    }
    
    return <div className="" style={{maxHeight:props.height+"px"}}>
    <div ref={headerRef as any} className="d-flex" onMouseEnter={_=> setState({isHeadHover:true})} 
        onMouseLeave={_=> setState({isHeadHover:false})}>
        <div className="d-flex flex-grow-1 hover" onClick={handleChangesCollapse}
            >
            <span>{props.isExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
            <span>Deleted files</span>
            {!!props.files?.length && <span className="text-info">({props.files.length})</span>}
        </div>
        {state.isHeadHover && <div className="d-flex">
            <span className="hover" title="Discard all" onClick={_=>discardAll()}><FaUndo /></span>
            <span className="px-1" />
            <span className="hover" title="Stage all" onClick={_=> stageAll()}><FaPlus /></span>
        </div>}
    </div>
    {props.isExpanded && 
        <div className="d-flex flex-column ps-2 border" style={{overflowX:'hidden',overflowY:'auto', maxHeight:`${fileListPanelHeight}px`}} onMouseLeave={_=> setState({hoveredFile:undefined})}
            >
            {props.files?.map(f=>(
                <div key={f.path} className="d-flex align-items-center flex-nowrap position-relative hover"
                    title={f.path} onMouseEnter= {_ => setState({hoveredFile:f})} onClick={(_)=> props.onFileSelect(f.path)}>
                    <span className="pe-1 flex-shrink-0">{f.fileName}</span>
                    <span className="small text-secondary">{f.path}</span>
                    {state.hoveredFile?.path === f.path &&
                     <div className="position-absolute d-flex bg-white ps-2" style={{ right: 0 }}>
                        <span className="hover" title="discard" onClick={_=> discardUnstagedChangesOfItem(f)}><FaUndo /></span>
                        <span className="px-1" />
                        <span className="hover" title="Stage" onClick={_=>handleStage(f)}><FaPlus /></span>
                    </div>}
                </div>
            ))}                                                
        </div>
    }
</div>
}

export const DeletedFiles = React.memo(DeletedFilesComponent);