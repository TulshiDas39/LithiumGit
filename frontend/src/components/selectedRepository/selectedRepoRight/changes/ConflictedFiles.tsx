import { IFile, RepositoryInfo, IStatus, RendererEvents } from "common_library";
import React, { Fragment } from "react"
import { FaAngleDown, FaAngleRight, FaUndo, FaPlus } from "react-icons/fa";
import { useMultiState } from "../../../../lib";

interface IConflictedFilesProps{
    files?:IFile[];
    repoInfoInfo?:RepositoryInfo;
    onStatusChange:(status:IStatus)=>void;
    onFileSelect:(path:string)=>void;
    selectedFilePath?:string;
}

interface IState{
    isChangesExpanded:boolean;
    hoveredFile?:IFile;
    isHeadHover:boolean;
}

function ConflictedFilesComponent(props:IConflictedFilesProps){    
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
    
    return <Fragment>
    <div className="d-flex" onMouseEnter={_=> setState({isHeadHover:true})} 
        onMouseLeave={_=> setState({isHeadHover:false})}>
        <div className="d-flex flex-grow-1 hover" onClick={handleChangesCollapse}
            >
            <span>{state.isChangesExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
            <span>Conflicted files</span>
        </div>
        {state.isHeadHover && <div className="d-flex">
            <span className="hover" title="Discard all" onClick={_=>discardAll()}><FaUndo /></span>
            <span className="px-1" />
            <span className="hover" title="Stage all" onClick={_=> stageAll()}><FaPlus /></span>
        </div>}
    </div>
    
    {state.isChangesExpanded && 
        <div className="container ps-2" onMouseLeave={_=> setState({hoveredFile:undefined})}>
            {props.files?.map(f=>(
                <div key={f.path} title={f.path} onMouseEnter= {_ => setState({hoveredFile:f})}
                    className={`row g-0 align-items-center flex-nowrap hover w-100 ${props.selectedFilePath === f.path?"selected":""}`}
                    >
                    <div className="col-auto overflow-hidden align-items-center" onClick={(_)=> props.onFileSelect(f.path)}>
                        <span className="pe-1 flex-shrink-0">{f.fileName}</span>
                        <span className="small text-secondary">
                            <span>{f.path}</span>
                        </span>
                    </div>
                    
                    {state.hoveredFile?.path === f.path &&
                     <div className="col ps-2 align-items-center text-end">
                        <span className="hover" title="discard" onClick={_=> discardUnstagedChangesOfItem(f)}><FaUndo /></span>
                        <span className="px-1" />
                        <span className="hover" title="Stage" onClick={_=>handleStage(f)}><FaPlus /></span>
                    </div>}
                </div>
            ))}                                                
        </div>
    }
</Fragment>
    
}

export const ConflictedFiles = React.memo(ConflictedFilesComponent);