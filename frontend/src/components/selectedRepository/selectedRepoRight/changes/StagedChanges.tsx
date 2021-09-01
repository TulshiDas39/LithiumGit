import { IFile, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { useEffect } from "react";
import { Fragment } from "react";
import { FaAngleDown, FaAngleRight, FaMinus } from "react-icons/fa";
import { UiUtils, useMultiState } from "../../../../lib";


interface IStagedChangesProps{
    stagedChanges:IFile[];
    repoInfoInfo?:RepositoryInfo;
    onStatusChange:(status:IStatus)=>void;

}

interface IState{
    isStagedChangesExpanded:boolean;
    hoveredFile?:IFile;
}

function StagedChangesComponent(props:IStagedChangesProps){
    const [state,setState] = useMultiState<IState>({isStagedChangesExpanded:true});
    const handleStageCollapse = () => {
        setState({ isStagedChangesExpanded: !state.isStagedChangesExpanded });
    }

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.unStageItem().replyChannel,(_,res:IStatus)=>{
            console.log('unstaged',res);
            props.onStatusChange(res);
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.unStageItem().replyChannel]);
        }
    },[]);

    const handleUnstageItem = (item:IFile)=>{
        window.ipcRenderer.send(RendererEvents.unStageItem().channel,[item.path],props.repoInfoInfo)
    }

    return <Fragment>
    <div className="d-flex hover" onClick={handleStageCollapse}>
        <span>{state.isStagedChangesExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
        <span>Staged Changes</span>
    </div>
    {state.isStagedChangesExpanded && 
    <div className="d-flex flex-column ps-2" onMouseLeave={_=> setState({hoveredFile:undefined})}>
        {props.stagedChanges.map(f=>(
            <div key={f.path} className="d-flex align-items-center flex-nowrap position-relative hover" 
                title={f.path} onMouseEnter={()=> setState({hoveredFile:f})}>
                <span className="pe-1 flex-shrink-0">{f.fileName}</span>
                <span className="small text-secondary">{f.path}</span>
                {state.hoveredFile?.path === f.path && <div className="position-absolute d-flex bg-white ps-3" style={{ right: 0 }}>
                    <span className="hover" title="Unstage" onClick={_=> handleUnstageItem(f)}><FaMinus /></span>                                    
                </div>}
            </div>
        ))}                        
    </div>
    }
</Fragment>
}

export const StagedChanges = React.memo(StagedChangesComponent);