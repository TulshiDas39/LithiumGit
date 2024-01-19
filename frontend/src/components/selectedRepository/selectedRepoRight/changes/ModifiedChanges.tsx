import { EnumChangeType, IFile, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { Fragment, useEffect, useRef } from "react"
import { FaAngleDown, FaAngleRight, FaPlus, FaUndo } from "react-icons/fa";
import { EnumChangeGroup, UiUtils, useMultiState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";

interface IModifiedChangesProps{
    changes:IFile[];
    repoInfoInfo?:RepositoryInfo;    
    onFileSelect:(file:IFile)=>void;
    selectedFilePath?:string;
    selectedMode:EnumChangeGroup;    
}

interface IState{
    hoveredFile?:IFile;
    firstPaneHeight?:number;
}

function ModifiedChangesComponent(props:IModifiedChangesProps){
    const [state,setState] = useMultiState<IState>({});

    const ref = useRef<HTMLDivElement>();
    const getStatusText = (changeType:EnumChangeType)=>{
        if(changeType === EnumChangeType.MODIFIED)
            return "M";
        if(changeType === EnumChangeType.CREATED)
            return "U";
        return "D";
    }

    const handleStage=(file:IFile)=>{
        IpcUtils.stageItems([file.path],props.repoInfoInfo!).then(_=>{
            IpcUtils.getRepoStatus();
        });
    }

    const stageAll=()=>{
        if(!props.changes?.length) return;
        IpcUtils.stageItems(props.changes.map(x=>x.path),props.repoInfoInfo!).then(_=>{
            IpcUtils.getRepoStatus();
        });        
    }

    const discardUnstagedChangesOfItem=(item:IFile)=>{
        if(item.changeType === EnumChangeType.CREATED){
            IpcUtils.cleanItems([item.path], props.repoInfoInfo!).then(_=>{
                IpcUtils.getRepoStatus();
            });
        }
        else if(item.changeType === EnumChangeType.MODIFIED){
            IpcUtils.discardItems([item.path],props.repoInfoInfo!).then(_=>{
                IpcUtils.getRepoStatus();
            });
        }            
    }

    const discardAll=()=>{
        if(!props.changes?.length) return;
        IpcUtils.discardItems(["."],props.repoInfoInfo!).then(_=>{
            IpcUtils.cleanItems([],props.repoInfoInfo!).then(_=>{
                IpcUtils.getRepoStatus();
            });
        });
        
    }   
    useEffect(()=>{
        UiUtils.resolveHeight("stage_unstage_all").then(height=>{
            setState({firstPaneHeight:height});
        })
    },[])
    console.log("height", state.firstPaneHeight);
    
    return <div className="h-100">
            <div id="stage_unstage_all" className="d-flex justify-content-center align-items-center pt-2">
                <span className="h4 hover-brighter bg-danger py-1 px-2 cur-default" title="Discard all" onClick={_=>discardAll()}>
                    <FaUndo />
                </span>
                <span className="px-2" />
                <span className="h4 hover-brighter bg-success py-1 px-2 cur-default" title="Stage all" onClick={_=> stageAll()}>
                    <FaPlus />
                </span>
            </div>        
            {!!state.firstPaneHeight &&
                <div className="container ps-2 border overflow-auto" style={{height:`calc(100% - ${state.firstPaneHeight}px)`}} onMouseLeave={_=> setState({hoveredFile:undefined})}>
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
            </div>}
    </div>
}

export const ModifiedChanges = React.memo(ModifiedChangesComponent);