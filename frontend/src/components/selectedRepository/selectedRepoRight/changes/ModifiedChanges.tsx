import { EnumChangeType, IFile, RendererEvents, RepositoryInfo, StringUtils } from "common_library";
import React, { Fragment, useEffect, useRef } from "react"
import { FaPlus, FaUndo } from "react-icons/fa";
import { RepoUtils, DiffUtils, EnumChangeGroup, EnumHtmlIds, EnumModals, ILine, ReduxUtils, UiUtils, useMultiState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { ModalData } from "../../../modals/ModalData";
import { shallowEqual, useDispatch } from "react-redux";
import { ActionChanges, ActionModals } from "../../../../store";
import { ChangeUtils } from "../../../../lib/utils/ChangeUtils";
import { useSelectorTyped } from "../../../../store/rootReducer";

interface IModifiedChangesProps{
    changes:IFile[];
    repoInfoInfo?:RepositoryInfo;
}

interface IState{
    hoveredFile?:IFile;
    lastUpdated:string;
}

function ModifiedChangesComponent(props:IModifiedChangesProps){
    const [state,setState] = useMultiState<IState>({lastUpdated:""});
    const store = useSelectorTyped(state => ({
        selectedFile:state.changes.selectedFile?.changeGroup === EnumChangeGroup.UN_STAGED?state.changes.selectedFile:undefined,
        focusVersion:state.ui.versions.appFocused,
    }),shallowEqual);

    const dispatch = useDispatch();    
    const refData = useRef({selectedFileContent:[] as string[],lastUpdated:""});
    const getStatusText = (changeType:EnumChangeType)=>{
        if(changeType === EnumChangeType.MODIFIED)
            return "M";
        if(changeType === EnumChangeType.CREATED)
            return "U";
        return "D";
    }

    const handleStage=(file:IFile)=>{
        IpcUtils.stageItems([file.path]).then(_=>{
            IpcUtils.getRepoStatus();
        });
    }

    const stageAll=()=>{
        if(!props.changes?.length) return;
        IpcUtils.stageItems(props.changes.map(x=>x.path)).then(_=>{
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

    const displayChanges = async(path:string)=>{
        return new Promise<boolean>((res)=>{
            ChangeUtils.containerId = EnumHtmlIds.diffview_container;
            const joinedPath = window.ipcRenderer.sendSync(RendererEvents.joinPath().channel, RepoUtils.repositoryDetails.repoInfo.path,path);
            if(store.selectedFile?.changeType !== EnumChangeType.DELETED){
                IpcUtils.getFileContent(joinedPath).then(lines=>{
                    refData.current.selectedFileContent = lines;
                    if(store.selectedFile?.changeType === EnumChangeType.MODIFIED){
                        DiffUtils.getDiff(store.selectedFile.path).then(str=>{
                            let lineConfigs = DiffUtils.GetUiLines(str,refData.current.selectedFileContent);
                            ChangeUtils.currentLines = lineConfigs.currentLines;
                            ChangeUtils.previousLines = lineConfigs.previousLines;
                            ChangeUtils.showChanges();
                            res(true);                            
                        });
                    }
                    if(store.selectedFile?.changeType === EnumChangeType.CREATED){            
                        const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
                        ChangeUtils.currentLines = lineConfigs;
                        ChangeUtils.previousLines = null!;
                        ChangeUtils.showChanges();
                        res(true);
                    }
                })
            }
            else{            
                IpcUtils.getGitShowResult([`HEAD:${store.selectedFile.path}`]).then(content=>{                
                    const lines = StringUtils.getLines(content);
                    const hasChanges = UiUtils.hasChanges(refData.current.selectedFileContent,lines);
                    if(!hasChanges) return;
                    refData.current.selectedFileContent = lines;
                    const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
                    ChangeUtils.currentLines = null!;
                    ChangeUtils.previousLines = lineConfigs!;
                    ChangeUtils.showChanges();
                    res(true);
                })
            }
        })
    }

    useEffect(()=>{
        if(!store.selectedFile)
            return ;
        
        displayChanges(store.selectedFile.path).then(()=>{
            dispatch(ActionChanges.updateData({currentStep:1, totalStep:ChangeUtils.totalChangeCount}));
            setState({lastUpdated:""});
        })
        ChangeUtils.file = store.selectedFile;
                
    },[store.selectedFile]);

    useEffect(()=>{
        if(!store.selectedFile || !refData.current.lastUpdated || !state.lastUpdated)
            return;
        displayChanges(store.selectedFile.path).then(()=>{
            dispatch(ActionChanges.updateData({totalStep:ChangeUtils.totalChangeCount}));
        });                
    },[state.lastUpdated]);

    useEffect(()=>{
        if(!store.selectedFile)
            return;     
        if(store.selectedFile.changeType === EnumChangeType.DELETED)
            return;
        IpcUtils.getLastUpdatedDate(store.selectedFile.path).then(date=>{            
            if(date){
                setState({lastUpdated:date});
            }
        });        
    },[store.focusVersion])

    const handleFileSelect = (file:IFile)=>{
        if(store.selectedFile?.path !== file.path){
            IpcUtils.getLastUpdatedDate(file.path).then(date=>{
                
                dispatch(ActionChanges.updateData({selectedFile: file,currentStep:0,totalStep:0}));
            })
        }
    }

    useEffect(()=>{
        refData.current.lastUpdated = state.lastUpdated;
    },[state.lastUpdated])

    
    return <div className="h-100" id={EnumHtmlIds.modifiedChangesPanel}>
            {!!props.changes?.length && <div id={EnumHtmlIds.stage_unstage_allPanel} className="d-flex py-2 ps-2" style={{height:40}}>
                <span className="d-flex align-items-center hover-brighter bg-danger px-2 cur-default" title="Discard all" onClick={_=>discardAll()}>
                    <FaUndo />
                </span>
                <span className="px-2" />
                <span className="d-flex align-items-center hover-brighter bg-success py-1 px-2 cur-default" title="Stage all" onClick={_=> stageAll()}>
                    <FaPlus />
                </span>
            </div>}        
            
            <div className="container ps-2 border overflow-auto" style={{height:`calc(100% - 40px)`}} onMouseLeave={_=> setState({hoveredFile:undefined})}>
                    {props.changes?.map(f=>(
                        <div key={f.path} title={f.path} onMouseEnter= {_ => setState({hoveredFile:f})}
                            className={`row g-0 align-items-center flex-nowrap hover w-100 ${store.selectedFile?.path === f.path ?"selected":""}`}
                            >
                            <div className={`col-auto overflow-hidden align-items-center flex-shrink-1`} onClick={(_)=> handleFileSelect(f)}
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
                                    <span className={`ps-1 fw-bold ${UiUtils.getChangeTypeHintColor(f.changeType)}`} title={StringUtils.getStatusText(f.changeType)}>{getStatusText(f.changeType)}</span>
                                </span>
                            </div>
                        </div>
                    ))}                                                                
            </div>
    </div>
}

export const ModifiedChanges = React.memo(ModifiedChangesComponent);