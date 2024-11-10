import { IFile, RepositoryInfo, IStatus, RendererEvents } from "common_library";
import React, { Fragment, useMemo } from "react";
import { FaAngleDown, FaAngleRight, FaUndo, FaPlus } from "react-icons/fa";
import { useMultiState } from "../../../../lib";


interface IUntrackedFilesProps{
    files?:IFile[];
    repoInfoInfo?:RepositoryInfo;
    onStatusChange:(status:IStatus)=>void;
    onFileSelect:(path:string)=>void;
    handleExpand:(isExpanded:boolean)=>void;
    height:number;
}

interface IState{
    isChangesExpanded:boolean;
    hoveredFile?:IFile;
    isHeadHover:boolean;
}

function UntrackedFilesComponent(props:IUntrackedFilesProps){
    const [state,setState] = useMultiState<IState>({
        isChangesExpanded:true,
        isHeadHover:false});

    const handleChangesCollapse = () => {
        setState({ isChangesExpanded: !state.isChangesExpanded });
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


    
    return <div className="overflow-auto" style={{maxHeight:props.height}}>
    <div className="d-flex" onMouseEnter={_=> setState({isHeadHover:true})} 
        onMouseLeave={_=> setState({isHeadHover:false})}>
        <div className="d-flex flex-grow-1 hover" onClick={handleChangesCollapse}
            >
            <span>{state.isChangesExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
            <span>New files</span>
            {!!props.files?.length && <span className="text-info">({props.files.length})</span>}
        </div>
        {state.isHeadHover && <div className="d-flex">
            <span className="hover" title="Discard all" onClick={_=>discardAll()}><FaUndo /></span>
            <span className="px-1" />
            <span className="hover" title="Stage all" onClick={_=> stageAll()}><FaPlus /></span>
        </div>}
    </div>
    {state.isChangesExpanded && 
        <div className="d-flex flex-column ps-2 border" onMouseLeave={_=> setState({hoveredFile:undefined})}>
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

export const UntrackedFiles = React.memo(UntrackedFilesComponent);