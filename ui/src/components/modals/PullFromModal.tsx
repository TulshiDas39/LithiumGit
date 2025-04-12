import React, { useEffect, useMemo, useRef } from "react";
import { AppButton } from "../common";
import { Modal, Form } from "react-bootstrap";
import { shallowEqual, useDispatch } from "react-redux";
import { EnumModals, useMultiState, RepoUtils, Data } from "../../lib";
import { IpcUtils } from "../../lib/utils/IpcUtils";
import { ActionModals, ActionSavedData } from "../../store";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionUI, ILoaderInfo } from "../../store/slices/UiSlice";
import { FaTimes } from "react-icons/fa";
import { ModalData } from "./ModalData";
import { Messages } from "../../lib/constants";
import { GitUtils } from "../../lib/utils/GitUtils";
import { createAnnotation, EnumAnnotationType, StringUtils } from "common_library";

interface IState{
    branch:string;
    options:string[];
    isSelected:boolean;
    inputFocused:boolean;
}

function PullFromModalComponent(){
    const store = useSelectorTyped(state=>({
        show:state.modal.openedModals.includes(EnumModals.PULL_FROM),        
    }),shallowEqual);

    const [state,setState] = useMultiState<IState>({
        branch:"",
        options:[],
        isSelected:false,
        inputFocused:false,
    });

    const dispatch = useDispatch();
    const refData = useRef({hoverOptions:false});

    const annotations = useMemo(()=>{
        if(!store.show)
            return [];
        const repoId = RepoUtils.repositoryDetails.repoInfo._id;
        return Data.annotations.filter(_=> _.type === EnumAnnotationType.PullFrom && _.repoId === repoId);
    },[store.show])

    const closeModal=()=>{
        dispatch(ActionModals.hideModal(EnumModals.PULL_FROM));
        clearState();
    }

    const clearState = ()=>{
        setState({branch:""});;
    }

    const updateAnnotation=()=>{
        if(annotations.some(_=> _.value == state.branch))
            return;
        const newAnnot= createAnnotation({
            repoId:RepoUtils.repositoryDetails.repoInfo._id,
            type:EnumAnnotationType.PullFrom,
            value:state.branch
        });
        IpcUtils.addAnnotation([newAnnot]).then(r=>{
            if(!r.error){
                Data.annotations.push(newAnnot);
            }
        })
    }

    const handlePull=()=>{
        if(!state.branch)
            return ;
        const originName = RepoUtils.activeOriginName;
        const options = [originName,state.branch];
        const loader:ILoaderInfo = {text:Messages.pull,id:StringUtils.uuidv4()};
        dispatch(ActionUI.setLoader(loader));
        IpcUtils.trigerPull(options).then((r)=>{
            if(!r.error){
                ModalData.appToast.message = "Pull succeeded.";
                dispatch(ActionModals.showModal(EnumModals.TOAST));
                updateAnnotation();
            }
            dispatch(ActionUI.removeLoader(loader.id));
            dispatch(ActionUI.setSync({text:Messages.getStatus}));
            GitUtils.getStatus().finally(()=>{                
                dispatch(ActionUI.setSync(undefined));
            })
        }).finally(()=>{
            const newPullFrom = state.branch;
            const repo = RepoUtils.repositoryDetails.repoInfo;
            if(newPullFrom !== repo?.pullFromBranch){            
                repo.pullFromBranch = newPullFrom;
                dispatch(ActionSavedData.updateRepository(repo));
            }
        })
        closeModal();        
    }

    useEffect(()=>{
        if(!store.show)
            return ;
        const pullFromBranch = RepoUtils.repositoryDetails.repoInfo.pullFromBranch || "";
        setState({options:[],isSelected:!!pullFromBranch,branch:pullFromBranch});
    },[store.show])

    useEffect(()=>{
        const allOptions = annotations.map(_=>_.value);
        let options:string[] = [];
        if(!state.isSelected && state.inputFocused){                                  
            options = allOptions.filter(_ => _.toLowerCase().includes(state.branch.toLowerCase()));            
        }
        
        setState({options});
    },[state.branch,state.isSelected,state.inputFocused,annotations])

    const handleSelect=(option:string)=>{
        setState({branch:option,isSelected:true,inputFocused:false});
    }

    const handleBlur = ()=>{
        if(refData.current.hoverOptions)
            return;
        setState({inputFocused:false});
    }

    return <Modal show={store.show} centered size="sm" backdrop={false}>
    <Modal.Body>
        <div className="container">
            <div className="row g-0">
                <div className="col-11">
                    <span className="text-success">Pull</span>
                </div>
                <div className="col-1 text-end">
                    <span className="hover" onClick={_=> dispatch(ActionModals.hideModal(EnumModals.PULL_FROM))}><FaTimes /></span>
                </div>
            </div>
            <hr />
            <div className="row g-0">
                <div className="col-12 text-break overflow-x-auto" style={{maxWidth:600,maxHeight:500}}>
                <div className="position-relative w-100">
                    <Form.Control type="text" placeholder="Branch name" value={state.branch} onChange={e=>setState({branch:e.target.value,isSelected:false})}
                    onFocus={()=> setState({inputFocused:true})} onBlur={()=>handleBlur()} />
                    {!!state.options.length && <div className="position-absolute bg-color border px-2 overflow-y-auto"
                            style={{top:`110%`,left:0,minWidth:'100%',maxHeight:'75vh',maxWidth:500, overflowY:'auto'}}
                            onMouseEnter={()=> {refData.current.hoverOptions = true}} onMouseLeave={()=>{refData.current.hoverOptions = false}}>
                            {
                                    state.options.map(br=>(
                                        <div title={br} key={br} className="border-bottom py-1 hover overflow-hidden text-nowrap" style={{textOverflow:'ellipsis'}}
                                            onClick={()=>handleSelect(br)}>
                                            {br}
                                        </div>
                                    ))
                                }
                        </div>
                        }
                </div>                    

                </div>
            </div>
            <div className="row g-0">
                <div className="col-12 pt-2 text-break overflow-auto d-flex align-items-center justify-content-center" style={{maxWidth:600,maxHeight:500}}>
                    <AppButton text="Pull" type="success" onClick={()=>handlePull()} />
                </div>
            </div>

        </div>
    </Modal.Body>
</Modal>
}

export const PullFromModal = React.memo(PullFromModalComponent);