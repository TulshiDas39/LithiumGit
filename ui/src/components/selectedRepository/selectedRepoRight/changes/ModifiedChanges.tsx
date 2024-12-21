import { EnumChangeType, IFile, RendererEvents, RepositoryInfo, StringUtils } from "common_library";
import React, { Fragment, useEffect, useRef } from "react"
import { FaPlus, FaUndo } from "react-icons/fa";
import { RepoUtils, DiffUtils, EnumChangeGroup, EnumHtmlIds, EnumModals, ILine, UiUtils, useMultiState, IContextItem } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { ModalData } from "../../../modals/ModalData";
import { shallowEqual, useDispatch } from "react-redux";
import { ActionChanges, ActionModals } from "../../../../store";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { GitUtils } from "../../../../lib/utils/GitUtils";
import { ChangesData } from "../../../../lib/data/ChangesData";

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
    const refData = useRef({selectedFileContent:[] as string[],lastUpdated:"",isMounted:false});
    const getStatusText = (changeType:EnumChangeType)=>{
        if(changeType === EnumChangeType.MODIFIED)
            return "M";
        if(changeType === EnumChangeType.CREATED)
            return "U";
        return "D";
    }

    const handleStage=(file:IFile)=>{
        IpcUtils.stageItems([file.path]).then(_=>{
            GitUtils.getStatus();
        });
    }

    const stageAll=()=>{
        if(!props.changes?.length) return;
        IpcUtils.stageItems(props.changes.map(x=>x.path)).then(_=>{
            GitUtils.getStatus();
        });        
    }

    const discardUnstagedChangesOfItem=(item:IFile)=>{
        let yesHandler:()=>void = ()=>{};
        let text = "";
        if(item.changeType === EnumChangeType.CREATED){
            text = `Delete ${item.fileName}?`;
            yesHandler= ()=>{
                IpcUtils.cleanItems([item.path], props.repoInfoInfo!).then(_=>{
                    GitUtils.getStatus();
                });
            }
        }
        else if(item.changeType === EnumChangeType.MODIFIED){
            text = `Discard the changes of ${item.fileName}?`;
            yesHandler = () =>{
                IpcUtils.discardItems([item.path],props.repoInfoInfo!).then(_=>{
                    GitUtils.getStatus();
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
                    GitUtils.getStatus();
                });
            });
        }
        ModalData.confirmationModal.message = text;
        ModalData.confirmationModal.YesHandler = yesHandler;
        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
    }    

    const displayChanges = async(path:string)=>{
        return new Promise<boolean>((res)=>{
            const joinedPath = window.ipcRenderer.sendSync(RendererEvents.joinPath().channel, RepoUtils.repositoryDetails.repoInfo.path,path);
            if(store.selectedFile?.changeType !== EnumChangeType.DELETED){
                IpcUtils.getFileContent(joinedPath).then(lines=>{
                    refData.current.selectedFileContent = lines;
                    if(store.selectedFile?.changeType === EnumChangeType.MODIFIED){
                        DiffUtils.getDiff(store.selectedFile.path).then(str=>{
                            let lineConfigs = DiffUtils.GetUiLines(str,refData.current.selectedFileContent);
                            ChangesData.changeUtils.currentLines = lineConfigs.currentLines;
                            ChangesData.changeUtils.previousLines = lineConfigs.previousLines;
                            ChangesData.changeUtils.showChanges();
                            res(true);                            
                        });
                    }
                    if(store.selectedFile?.changeType === EnumChangeType.CREATED){            
                        const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
                        ChangesData.changeUtils.currentLines = lineConfigs;
                        ChangesData.changeUtils.previousLines = null!;
                        ChangesData.changeUtils.showChanges();
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
                    ChangesData.changeUtils.currentLines = null!;
                    ChangesData.changeUtils.previousLines = lineConfigs!;
                    ChangesData.changeUtils.showChanges();
                    res(true);
                })
            }
        })
    }

    useEffect(()=>{
        if(!store.selectedFile || !refData.current.isMounted)
            return ;
        
        displayChanges(store.selectedFile.path).then(()=>{
            dispatch(ActionChanges.updateData({currentStep:1, totalStep:ChangesData.changeUtils.totalChangeCount}));            
        })
        ChangesData.changeUtils.file = store.selectedFile;

        IpcUtils.getLastUpdatedDate(store.selectedFile.path).then(date=>{
            refData.current.lastUpdated = date;
        })
                
    },[store.selectedFile]);

    useEffect(()=>{
        if(!store.selectedFile || !refData.current.isMounted)
            return;
        displayChanges(store.selectedFile.path).then(()=>{
            dispatch(ActionChanges.updateData({totalStep:ChangesData.changeUtils.totalChangeCount}));
            dispatch(ActionChanges.increamentStepRefreshVersion());
        });                
    },[state.lastUpdated]);

    useEffect(()=>{
        if(!store.selectedFile || !refData.current.isMounted)
            return;     
        if(store.selectedFile.changeType === EnumChangeType.DELETED)
            return;
        IpcUtils.getLastUpdatedDate(store.selectedFile.path).then(date=>{            
            if(date !== refData.current.lastUpdated){
                refData.current.lastUpdated = date;
                setState({lastUpdated:date});
            }
            else{
                refData.current.lastUpdated = date;
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
        refData.current.isMounted = true;
    },[])

    const copyFile=(file:IFile)=>{
        const path = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path,file.path);
        UiUtils.copy(path);
    }

    const showInDirectory=(file:IFile)=>{
        const path = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path,file.path);
        IpcUtils.showInFileExplorer(path);
    }
    
    
    const handleContext = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, file:IFile)=>{
        const handleIgnore=()=>{

        }
        const items:IContextItem[] = [
            {
                text:`Copy path`,
                onClick:()=>copyFile(file)
            }            
        ]
        if(file.changeType !== EnumChangeType.DELETED){
            items.push({
                text:`Open containing folder`,
                onClick:()=>showInDirectory(file)
            })
        }
        if(file.changeType === EnumChangeType.CREATED){
            items.push({
                text:`Ignore '${file.fileName}'`,
                onClick:handleIgnore
            })
        }
        if(file.changeType === EnumChangeType.MODIFIED){
            items.push({
                text:`Delete from git`,
                onClick:handleIgnore
            })
        }
        ModalData.contextModal.items = items;
        ModalData.contextModal.position = {x:e.clientX,y:e.clientY};

        UiUtils.openContextModal();
    }

    return <div className="h-100" id={EnumHtmlIds.modifiedChangesPanel}>
            {!!props.changes?.length && <div id={EnumHtmlIds.stage_unstage_allPanel} className="d-flex py-2 ps-2" style={{height:40}}>
                <span className="d-flex align-items-center hover-shadow hover-brighter bg-danger px-2 cur-default" title="Discard all" onClick={_=>discardAll()}>
                    <FaUndo />
                </span>
                <span className="px-2" />
                <span className="d-flex align-items-center hover-shadow hover-brighter bg-success py-1 px-2 cur-default" title="Stage all" onClick={_=> stageAll()}>
                    <FaPlus />
                </span>
            </div>}        
            
            <div className="container ps-2 border overflow-auto" style={{height:`calc(100% - 40px)`}} onMouseLeave={_=> setState({hoveredFile:undefined})}>
                    {props.changes?.map(f=>(
                        <div key={f.path} title={f.path} onMouseEnter= {_ => setState({hoveredFile:f})}
                            className={`row g-0 align-items-center flex-nowrap hover w-100 ${store.selectedFile?.path === f.path ?"selected":""}`}
                            onContextMenu={(e) => handleContext(e,f)}
                            >
                            <div className={`col-auto overflow-hidden align-items-center flex-shrink-1`} onClick={(_)=> handleFileSelect(f)}
                            style={{textOverflow:'ellipsis'}}>
                                <span className={`pe-1 flex-shrink-0 text-nowrap ${f.changeType === EnumChangeType.DELETED?"text-decoration-line-through":""}`}>{f.fileName}</span>
                                <span className="small text-secondary text-nowrap">
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