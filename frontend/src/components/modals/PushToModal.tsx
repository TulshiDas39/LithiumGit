import { Form, Modal } from "react-bootstrap";
import { useSelectorTyped } from "../../store/rootReducer";
import { RepoUtils, EnumModals, useMultiState, Data } from "../../lib";
import { shallowEqual, useDispatch } from "react-redux";
import { ActionModals, ActionSavedData } from "../../store";
import React, { useEffect, useMemo, useRef } from "react";
import { AppButton } from "../common";
import { IpcUtils } from "../../lib/utils/IpcUtils";
import { ActionUI } from "../../store/slices/UiSlice";
import { FaTimes } from "react-icons/fa";
import { createAnnotation, EnumAnnotationType } from "common_library";

interface IState{
    branch:string;
    options:string[];
    isSelected:boolean;
    inputFocused:boolean;
}

function PushToModalComponent(){
    const store = useSelectorTyped(state=>({
        show:state.modal.openedModals.includes(EnumModals.PUSH_TO),        
    }),shallowEqual);

    const annotations = useMemo(()=>{
        if(!store.show)
            return [];
        return Data.annotations.filter(_=> _.type === EnumAnnotationType.PushTo);
    },[store.show])

    const [state,setState] = useMultiState<IState>({
        branch:"",
        options:[],
        isSelected:false,
        inputFocused:true,
    });

    const dispatch = useDispatch();

    const refData = useRef({hoverOptions:false});

    const closeModal=()=>{
        dispatch(ActionModals.hideModal(EnumModals.PUSH_TO));
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
            type:EnumAnnotationType.PushTo,
            value:state.branch
        });
        IpcUtils.addAnnotation(newAnnot).then(r=>{
            if(!r.error){
                const annots =[...annotations,newAnnot];
                Data.annotations = annots;
            }
        })
    }

    const handlePush=()=>{
        if(!state.branch)
            return ;
        const originName = RepoUtils.activeOriginName;
        const options = [originName,state.branch];
        dispatch(ActionUI.setLoader({text:"Push in progress..."}));
        IpcUtils.trigerPush(options).then((r)=>{
            IpcUtils.getRepoStatus().finally(()=>{                
                dispatch(ActionUI.setLoader(undefined));
            })
            if(!r.error){
                updateAnnotation();
            }
        }).finally(()=>{
            const newPushTo = state.branch;
            const repo = RepoUtils.repositoryDetails.repoInfo;
            if(newPushTo !== repo?.pushToBranch){            
                repo.pushToBranch = newPushTo;
                dispatch(ActionSavedData.updateRepository(repo));                
            }
        })
        closeModal();        
    }

    useEffect(()=>{
        if(!store.show)
            return ;
        const pushToBranch = RepoUtils.repositoryDetails.repoInfo.pushToBranch || "";        
        setState({options:[],isSelected:!!pushToBranch,branch:pushToBranch});        
    },[store.show])

    const handleSelect=(option:string)=>{
        setState({branch:option,isSelected:true,inputFocused:false});
    }

    useEffect(()=>{
        const allOptions = annotations.map(_=>_.value);
        let options:string[] = [];
        if(!state.isSelected && state.inputFocused){                                  
            options = allOptions.filter(_ => _.includes(state.branch));            
        }
        
        setState({options});
    },[state.branch,state.isSelected,state.inputFocused])
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
                    <span className="text-success">Push</span>
                </div>
                <div className="col-1 text-end">
                    <span className="hover" onClick={_=> dispatch(ActionModals.hideModal(EnumModals.PUSH_TO))}><FaTimes /> </span>
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
                    <AppButton text="Push" type="success" onClick={()=>handlePush()} />
                </div>
            </div>            
        </div>
    </Modal.Body>
</Modal>
}

export const PushToModal = React.memo(PushToModalComponent);