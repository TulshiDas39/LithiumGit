import { EnumChangeGroup, EnumConflictSide, IActionTaken, IFile, RepositoryInfo } from "common_library";
import React, { useEffect, useRef } from "react"
import { ConflictUtils, EnumHtmlIds, EnumModals, UiUtils, useMultiState } from "../../../../lib";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { AppButton } from "../../../common";
import { ActionChanges, ActionModals } from "../../../../store";
import { ModalData } from "../../../modals/ModalData";
import { FaEllipsisH } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";

interface ISingleFileProps{
    item:IFile
    handleSelect:(file:IFile)=>void;
    isSelected:boolean;
}

function SingleFile(props:ISingleFileProps){
    const [state,setState]=useMultiState({isHovered:false});

    return (
        <div key={props.item.path} className={`row g-0 align-items-center flex-nowrap hover w-100 ${props.isSelected ? "selected":""}`} 
        title={props.item.fileName} onMouseEnter={()=> setState({isHovered:true})} onMouseLeave={_=> setState({isHovered:false})} 
            onClick={_=> props.handleSelect(props.item)}>
            <div className="col-auto overflow-hidden flex-shrink-1" style={{textOverflow:'ellipsis'}}>
                <span className={`pe-1 flex-shrink-0`}>{props.item.fileName}</span>
                <span className="small text-secondary">{props.item.path}</span>
            </div>
        </div>
    )
}

interface IProps{
    changes:IFile[];
    repoInfoInfo?:RepositoryInfo;
}

interface IState{
    containerHeight?:number;
    firstPaneHeight?:number;
}

function ConflictedChangesComponent(props:IProps){
    const store = useSelectorTyped(state => ({
        selectedFile:state.changes.selectedFile,
    }),shallowEqual);
    
    const [state,setState] = useMultiState<IState>({});
    const dispatch = useDispatch();

    const headerRef = useRef<HTMLDivElement>();
    const refData = useRef({fileContentAfterChange:[] as string[]});

    useEffect(()=>{
        ConflictUtils.resetData();
        const setContainerHeight=()=>{
            UiUtils.resolveHeight(EnumHtmlIds.conflictedChangesPanel).then(height=>{
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
        if(!state.containerHeight)
            return;
        UiUtils.resolveHeight(EnumHtmlIds.acceptIncomingCurrentAllPanel).then(height=>{
            setState({firstPaneHeight:height});
        })
    },[state.containerHeight]);

    const handleSelect = (file?:IFile)=>{
        if(ConflictUtils.Actions.length){
            ModalData.confirmationModal.message = "Your changes will be discarded. Do you want to leave?";
            ModalData.confirmationModal.YesHandler = ()=>{
                dispatch(ActionChanges.updateData({selectedFile:file,currentStep:0,totalStep:0}));                
            }
            dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
        }else{
            dispatch(ActionChanges.updateData({selectedFile:file,currentStep:0,totalStep:0})); 
        }
    }

    const applyCommonMerge= async (paths:string[],action:IActionTaken)=>{
        const actions = [action];
        const resolvedPaths:string[] = [];
        for(let path of paths){
            try{
                await IpcUtils.resolveConflict(path,actions);
                resolvedPaths.push(path);
            }catch(e){}
        }

        return resolvedPaths;
    }

    const acceptAllIncomingChanges=()=>{
        const action:IActionTaken = {conflictNo:-1,taken:[EnumConflictSide.Incoming]};
        const paths = props.changes?.map(_=>_.path);
        if(!paths?.length)
            return;
        ModalData.confirmationModal.message = "Accept all incoming changes for all files?";
        ModalData.confirmationModal.YesHandler = ()=>{
            applyCommonMerge(paths,action).then(resolvedPaths=>{
                if(resolvedPaths.length) {
                    IpcUtils.stageItems(resolvedPaths).then(()=>{
                        IpcUtils.getRepoStatus();
                    });
                }
            });
        }
        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
        
    }

    const acceptAllCurrentChanges=()=>{
        const action:IActionTaken = {conflictNo:-1,taken:[EnumConflictSide.Current]};
        const paths = props.changes?.map(_=>_.path);
        if(!paths?.length)
            return;
        ModalData.confirmationModal.message = "Accept all current changes for all files?";
        ModalData.confirmationModal.YesHandler = ()=>{
            applyCommonMerge(paths,action).then(resolvedPaths=>{
                if(resolvedPaths.length) {
                    IpcUtils.stageItems(resolvedPaths).then(()=>{
                        IpcUtils.getRepoStatus();
                    })
                }
            });
        }
        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
        
    }
    
    return <div className="h-100" id={EnumHtmlIds.conflictedChangesPanel}>
    <div ref={headerRef as any} className="d-flex justify-content-end"
     >
        <div id={EnumHtmlIds.acceptIncomingCurrentAllPanel} className="d-flex justify-content-end align-items-center pt-2">            
            <Dropdown>
                <Dropdown.Toggle variant="link" id="dropdown-reposelection" className="rounded-0 no-caret">
                    <FaEllipsisH />
                </Dropdown.Toggle>
                <Dropdown.Menu className="no-radius">
                    <Dropdown.Item onClick={acceptAllIncomingChanges} className="border-bottom">Accept All Incoming Changes</Dropdown.Item>
                    <Dropdown.Item onClick={acceptAllCurrentChanges}>Accept All Current Changes</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            
        </div>        
    </div>
    { state.firstPaneHeight &&
    <div className="container ps-2 border overflow-auto" style={{height:`${state.containerHeight! - state.firstPaneHeight}px`}}>
        {props.changes.map(f=>(
            <SingleFile key={f.path} item={f} handleSelect={handleSelect}
                isSelected ={f.path === store.selectedFile?.path} />
        ))}        
    </div>
    }
    </div>
}

export const ConflictedChanges = React.memo(ConflictedChangesComponent);