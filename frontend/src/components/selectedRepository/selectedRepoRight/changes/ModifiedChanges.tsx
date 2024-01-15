import { EnumChangeType, IFile, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { Fragment, useEffect, useRef } from "react"
import { FaAngleDown, FaAngleRight, FaPlus, FaUndo } from "react-icons/fa";
import { EnumChangeGroup, useMultiState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";

interface IModifiedChangesProps{
    changes:IFile[];
    repoInfoInfo?:RepositoryInfo;    
    onFileSelect:(file:IFile)=>void;
    selectedFilePath?:string;
    selectedMode:EnumChangeGroup;
    handleExpand:(isExpanded:boolean)=>void;
    height:number;
}

interface IState{
    isExpanded:boolean;
    hoveredFile?:IFile;
    isHeadHover:boolean;
}

function ModifiedChangesComponent(props:IModifiedChangesProps){
    const [state,setState] = useMultiState<IState>({
        isExpanded:true,
        isHeadHover:false});

    const ref = useRef<HTMLDivElement>();
    const getStatusText = (changeType:EnumChangeType)=>{
        if(changeType === EnumChangeType.MODIFIED)
            return "M";
        if(changeType === EnumChangeType.CREATED)
            return "U";
        return "D";
    }

    useEffect(()=>{
        props.handleExpand(state.isExpanded);
    },[state.isExpanded])    

    const handleChangesCollapse = () => {
        setState({ isExpanded: !state.isExpanded });
    }

    const handleStage=(file:IFile)=>{
        IpcUtils.stageItems([file.path],props.repoInfoInfo!).then(res=>{
            console.log("done");
        });        
    }

    const stageAll=()=>{
        if(!props.changes?.length) return;
        IpcUtils.stageItems(props.changes.map(x=>x.path),props.repoInfoInfo!);        
    }

    const discardUnstagedChangesOfItem=(item:IFile)=>{
        window.ipcRenderer.send(RendererEvents.discardItem().channel,[item.path],props.repoInfoInfo);
    }

    const discardAll=()=>{
        if(!props.changes?.length) return;
        window.ipcRenderer.send(RendererEvents.discardItem().channel,props.changes.map(x=>x.path),props.repoInfoInfo);
    }
    
    return <div ref={ref as any} className="overflow-auto" style={{maxHeight:props.height}}>
    <div className="d-flex" onMouseEnter={_=> setState({isHeadHover:true})} 
        onMouseLeave={_=> setState({isHeadHover:false})}>
        <div className="d-flex flex-grow-1 hover" onClick={handleChangesCollapse}
            >
            <span>{state.isExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
            <span>Changes</span>
            {!!props.changes?.length && <span className="text-info">({props.changes.length})</span>}
        </div>
        {state.isHeadHover && <div className="d-flex">
            <span className="hover" title="Discard all" onClick={_=>discardAll()}><FaUndo /></span>
            <span className="px-1" />
            <span className="hover" title="Stage all" onClick={_=> stageAll()}><FaPlus /></span>
        </div>}

    </div>
    
    {state.isExpanded && 
        <div className="container ps-2 border" onMouseLeave={_=> setState({hoveredFile:undefined})}>
            {props.changes?.map(f=>(
                <div key={f.path} title={f.path} onMouseEnter= {_ => setState({hoveredFile:f})}
                    className={`row g-0 align-items-center flex-nowrap hover w-100 ${props.selectedFilePath === f.path && props.selectedMode === EnumChangeGroup.UN_STAGED?"selected":""}`}
                    >
                    <div className={`col-auto overflow-hidden align-items-center flex-shrink-1`} onClick={(_)=> props.onFileSelect(f)}
                    style={{textOverflow:'ellipsis'}}>
                        <span className={`pe-1 flex-shrink-0 ${f.changeType === EnumChangeType.DELETED?"text-decoration-line-through":""}`}>{f.fileName}</span>
                        <span className="small text-secondary">
                            <span>{f.path}</span>
                        </span>
                    </div>
                    
                    
                     <div className="col-auto align-items-center flex-nowrap overflow-hidden flex-grow-1 text-end">                        
                            {state.hoveredFile?.path === f.path && <Fragment>
                                <span className="hover" title="discard" onClick={_=> discardUnstagedChangesOfItem(f)}><FaUndo /></span>
                                <span className="px-1" />
                                <span className="hover" title="stage" onClick={_=>handleStage(f)}><FaPlus /></span>                                                
                            </Fragment>}
                            <span>
                                <span className="ps-1 text-success fw-bold">{getStatusText(f.changeType)}</span>
                            </span>
                    </div>
                </div>
            ))}                                                
        </div>
    }
    </div>
}

export const ModifiedChanges = React.memo(ModifiedChangesComponent);