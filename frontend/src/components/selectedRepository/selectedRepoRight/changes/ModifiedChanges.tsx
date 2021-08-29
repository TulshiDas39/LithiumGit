import { IFile, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { Fragment } from "react"
import { useEffect } from "react";
import { FaAngleDown, FaAngleRight, FaPlus, FaUndo } from "react-icons/fa";
import { UiUtils, useMultiState } from "../../../../lib";


interface IModifiedChangesProps{
    modifiedChanges?:IFile[];
    repoInfoInfo?:RepositoryInfo;
    onStatusChange:(status:IStatus)=>void;
}

interface IState{
    isChangesExpanded:boolean;
    hoveredFile?:IFile;
}

function ModifiedChangesComponent(props:IModifiedChangesProps){
    const [state,setState] = useMultiState<IState>({isChangesExpanded:true});

    const handleChangesCollapse = () => {
        setState({ isChangesExpanded: !state.isChangesExpanded });
    }

    const handleStage=(file:IFile)=>{
        window.ipcRenderer.send(RendererEvents.stageItem().channel,file.path,props.repoInfoInfo);
    }
    
    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.stageItem().replyChannel,(_,res:IStatus)=>{
            console.log(res);
            props.onStatusChange(res);
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.stageItem().replyChannel]);
        }
    },[]);
    
    return <Fragment>
    <div className="d-flex " onClick={handleChangesCollapse}>
        <div className="d-flex flex-grow-1 hover">
            <span>{state.isChangesExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
            <span>Changes</span>
        </div>
        <div className="d-flex">
            <span className="hover" title="Discard all"><FaUndo /></span>
            <span className="px-1" />
            <span className="hover" title="Stage all"><FaPlus /></span>
        </div>
    </div>
    {state.isChangesExpanded && 
        <div className="d-flex flex-column ps-2" onMouseLeave={_=> setState({hoveredFile:undefined})}>
            {props.modifiedChanges?.map(f=>(
                <div key={f.path} className="d-flex align-items-center flex-nowrap position-relative hover"
                    title={f.path} onMouseEnter= {_ => setState({hoveredFile:f})}>
                    <span className="pe-1 flex-shrink-0">{f.fileName}</span>
                    <span className="small text-secondary">{f.path}</span>
                    {state.hoveredFile?.path === f.path &&
                     <div className="position-absolute d-flex bg-white ps-2" style={{ right: 0 }}>
                        <span className="hover" title="discard"><FaUndo /></span>
                        <span className="px-1" />
                        <span className="hover" title="Stage" onClick={_=>handleStage(f)}><FaPlus /></span>
                    </div>}
                </div>
            ))}                                                
        </div>
    }
</Fragment>
}

export const ModifiedChanges = React.memo(ModifiedChangesComponent);