import { IFile, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { useEffect } from "react";
import { Fragment } from "react";
import { FaAngleDown, FaAngleRight, FaMinus } from "react-icons/fa";
import { EnumChangesType, UiUtils, useMultiState } from "../../../../lib";


interface IStagedChangesProps{
    stagedChanges?:IFile[];
    repoInfoInfo?:RepositoryInfo;
    onStatusChange:(status:IStatus)=>void;
    handleSelect:(path:string)=>void;
    selectedMode:EnumChangesType;
    selectedFilePath?:string;
    isExpanded:boolean;
    hanldeExpand:()=>void;
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

    const handleUnstageItem = (item:IFile)=>{
        window.ipcRenderer.send(RendererEvents.unStageItem().channel,[item.path],props.repoInfoInfo)
    }

    const unStageAll=()=>{
        if(!props.stagedChanges?.length) return;
        window.ipcRenderer.send(RendererEvents.unStageItem().channel,props.stagedChanges.map(x=>x.path),props.repoInfoInfo)
    }

    return <Fragment>
    <div className="d-flex hover" onMouseEnter={_=> setState({isHeadHover:true})} onMouseLeave={_=> setState({isHeadHover:false})}>
        <div className="d-flex flex-grow-1" onClick={props.hanldeExpand}>
            <span>{props.isExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
            <span>Staged Changes</span>
            {!!props.stagedChanges?.length && <span className="text-info">(`(${props.stagedChanges.length})`)</span>}
        </div>        
        {state.isHeadHover && <div className="d-flex">            
            <span className="hover" title="UnStage all" onClick={_=> unStageAll()}><FaMinus /></span>
        </div>}
        
    </div>
    {props.isExpanded && 
    <div className="container ps-2 border" onMouseLeave={_=> setState({hoveredFile:undefined})}>
        {props.stagedChanges?.map(f=>(
            <div key={f.path} className={`row g-0 align-items-center flex-nowrap hover w-100 ${props.selectedMode === EnumChangesType.STAGED && f.path === props.selectedFilePath?"selected":""}`} 
                title={f.path} onMouseEnter={()=> setState({hoveredFile:f})} onClick={_=> props.handleSelect(f.path)}>
                <div className="col-auto overflow-hidden">
                    <span className="pe-1 flex-shrink-0">{f.fileName}</span>
                    <span className="small text-secondary">{f.path}</span>
                </div>
                
                {state.hoveredFile?.path === f.path && <div className="col bg-white ps-3 text-end" style={{ right: 0 }}>
                    <span className="hover" title="Unstage" onClick={_=> handleUnstageItem(f)}><FaMinus /></span>                                    
                </div>}
            </div>
        ))}                        
    </div>
    }
</Fragment>
}

export const StagedChanges = React.memo(StagedChangesComponent);