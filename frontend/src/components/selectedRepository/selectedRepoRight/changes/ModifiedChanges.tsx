import { EnumChangeType, IFile, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { Fragment, useEffect, useRef } from "react"
import { FaAngleDown, FaAngleRight, FaPlus, FaUndo } from "react-icons/fa";
import { BranchUtils, DiffUtils, EnumChangeGroup, EnumHtmlIds, EnumModals, ILine, UiUtils, useMultiState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { ModalData } from "../../../modals/ModalData";
import { useDispatch } from "react-redux";
import { ActionModals } from "../../../../store";
import { ChangeUtils } from "../../../../lib/utils/ChangeUtils";

interface IModifiedChangesProps{
    changes:IFile[];
    repoInfoInfo?:RepositoryInfo;    
    onFileSelect:(file:IFile)=>void;
    selectedFile?:IFile;   
}

interface IState{
    hoveredFile?:IFile;
    firstPaneHeight?:number;
    containerHeight?:number;
}

function ModifiedChangesComponent(props:IModifiedChangesProps){
    const [state,setState] = useMultiState<IState>({});
    const dispatch = useDispatch();
    const ref = useRef<HTMLDivElement>();
    const refData = useRef({selectedFileContent:[] as string[]});
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
        let yesHandler:()=>void = ()=>{};
        let text = "";
        if(item.changeType === EnumChangeType.CREATED){
            text = `Delete ${item.fileName}?`;
            yesHandler= ()=>{
                IpcUtils.cleanItems([item.path], props.repoInfoInfo!).then(_=>{
                    IpcUtils.getRepoStatus();
                });
            }
        }
        else if(item.changeType === EnumChangeType.MODIFIED){
            text = `Discard the changes of ${item.fileName}?`;
            yesHandler = () =>{
                IpcUtils.discardItems([item.path],props.repoInfoInfo!).then(_=>{
                    IpcUtils.getRepoStatus();
                });
            }            
        }
        
        ModalData.confirmationModal.message = text;
        ModalData.confirmationModal.YesHandler = yesHandler;
        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
    }

    const discardAll=()=>{
        if(!props.changes?.length) return;        
        let text = "Discard all?";
        const yesHandler = ()=>{
            IpcUtils.discardItems(["."],props.repoInfoInfo!).then(_=>{
                IpcUtils.cleanItems([],props.repoInfoInfo!).then(_=>{
                    IpcUtils.getRepoStatus();
                });
            });
        }
        ModalData.confirmationModal.message = text;
        ModalData.confirmationModal.YesHandler = yesHandler;
        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
    }    
    
    useEffect(()=>{
        const setContainerHeight=()=>{
            UiUtils.resolveHeight(EnumHtmlIds.modifiedChangesPanel).then(height=>{
                setState({containerHeight:height});
            })
        }
        setContainerHeight();

        window.addEventListener("resize",setContainerHeight);
        return ()=>{
            window.removeEventListener("resize",setContainerHeight);
        }
    },[])

    useEffect(()=>{
        if(!state.containerHeight || props.changes?.length === 0)
            return;                
        UiUtils.resolveHeight(EnumHtmlIds.stage_unstage_allPanel).then(height=>{
            setState({firstPaneHeight:height});
        })
    },[state.containerHeight,props.changes?.length === 0]);

    useEffect(()=>{
        if(!props.selectedFile)
            return ;
        const joinedPath = window.ipcRenderer.sendSync(RendererEvents.joinPath().channel, BranchUtils.repositoryDetails.repoInfo.path,props.selectedFile.path);
        IpcUtils.getFileContent(joinedPath).then(lines=>{
            const hasChanges = UiUtils.hasChanges(refData.current.selectedFileContent,lines);
            if(!hasChanges) return;
            refData.current.selectedFileContent = lines;
            if(props.selectedFile?.changeType === EnumChangeType.MODIFIED){
                DiffUtils.getDiff(props.selectedFile.path).then(str=>{
                    let lineConfigs = DiffUtils.GetUiLines(str,refData.current.selectedFileContent);
                    ChangeUtils.currentLines = lineConfigs.currentLines;
                    ChangeUtils.previousLines = lineConfigs.previousLines;
                    ChangeUtils.showChanges();

                });
            }
            if(props.selectedFile?.changeType === EnumChangeType.CREATED){            
                const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
                ChangeUtils.currentLines = lineConfigs;
                ChangeUtils.previousLines = null!;
                ChangeUtils.showChanges();
            }
        })        
    },[props.selectedFile])
    
    return <div className="h-100" id={EnumHtmlIds.modifiedChangesPanel}>
            {!!props.changes?.length && <div id={EnumHtmlIds.stage_unstage_allPanel} className="d-flex align-items-center pt-2 ps-2">
                <span className="h4 hover-brighter bg-danger py-1 px-2 cur-default" title="Discard all" onClick={_=>discardAll()}>
                    <FaUndo />
                </span>
                <span className="px-2" />
                <span className="h4 hover-brighter bg-success py-1 px-2 cur-default" title="Stage all" onClick={_=> stageAll()}>
                    <FaPlus />
                </span>
            </div>}        
            {!!state.firstPaneHeight &&
                <div className="container ps-2 border overflow-auto" style={{height:`${state.containerHeight! - state.firstPaneHeight}px`}} onMouseLeave={_=> setState({hoveredFile:undefined})}>
                    {props.changes?.map(f=>(
                        <div key={f.path} title={f.path} onMouseEnter= {_ => setState({hoveredFile:f})}
                            className={`row g-0 align-items-center flex-nowrap hover w-100 ${props.selectedFile?.path === f.path ?"selected":""}`}
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