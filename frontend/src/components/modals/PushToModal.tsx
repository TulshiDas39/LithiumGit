import { Form, Modal } from "react-bootstrap";
import { useSelectorTyped } from "../../store/rootReducer";
import { BranchUtils, EnumModals, useMultiState } from "../../lib";
import { shallowEqual, useDispatch } from "react-redux";
import { ActionModals, ActionSavedData } from "../../store";
import React, { useEffect } from "react";
import { AppButton } from "../common";
import { IpcUtils } from "../../lib/utils/IpcUtils";
import { ActionUI } from "../../store/slices/UiSlice";

interface IState{
    branch:string;
    remember:boolean;
}

function PushToModalComponent(){
    const store = useSelectorTyped(state=>({
        show:state.modal.openedModals.includes(EnumModals.PUSH_TO),        
    }),shallowEqual);

    const [state,setState] = useMultiState<IState>({
        branch:"",
        remember:false,
    });

    const dispatch = useDispatch();

    const closeModal=()=>{
        dispatch(ActionModals.hideModal(EnumModals.PUSH_TO));
        clearState();
    }

    const clearState = ()=>{
        setState({branch:"",remember:false});;
    }

    const handlePush=()=>{
        if(!state.branch)
            return ;
        closeModal();
        const originName = BranchUtils.activeOriginName;
        const options = [originName,state.branch];
        dispatch(ActionUI.setLoader({text:"Push in progress..."}));
        IpcUtils.trigerPush(options).then(()=>{
            IpcUtils.getRepoStatus().finally(()=>{                
                dispatch(ActionUI.setLoader(undefined));
            })
        }).finally(()=>{
            const newPushTo = state.remember ? state.branch:"";
            const repo = BranchUtils.repositoryDetails.repoInfo;
            if(newPushTo !== repo?.pushToBranch){            
                repo.pushToBranch = newPushTo;
                dispatch(ActionSavedData.updateRepository(repo));
            }
        })
        
    }

    useEffect(()=>{
        if(!store.show)
            return ;
        const pushToBranch = BranchUtils.repositoryDetails.repoInfo.pushToBranch || "";
        setState({branch:pushToBranch,remember:!!pushToBranch});
    },[store.show])

    return <Modal show={store.show} centered size="sm" backdrop={false}>
    <Modal.Body>
        <div className="container">
            <div className="row g-0">
                <div className="col-11">
                    <span className="text-success">Push</span>
                </div>
                <div className="col-1 text-end">
                    <span className="hover" onClick={_=> dispatch(ActionModals.hideModal(EnumModals.PUSH_TO))}>&times;</span>
                </div>
            </div>
            <hr />
            <div className="row g-0">
                <div className="col-12 text-break overflow-auto" style={{maxWidth:600,maxHeight:500}}>
                    <Form.Control type="text" placeholder="Branch name" value={state.branch} onChange={e=>setState({branch:e.target.value})} />
                </div>
            </div>
            <div className="row g-0">
                <div className="col-12 pt-2 text-break overflow-auto d-flex align-items-center justify-content-center" style={{maxWidth:600,maxHeight:500}}>
                    <AppButton text="Push" type="success" onClick={handlePush} />
                </div>
            </div>
            <div className="row g-0">
                <div className="col-12 pt-2 text-break overflow-auto d-flex align-items-center justify-content-center" style={{maxWidth:600,maxHeight:500}}>
                    <input id="remember_push" type="checkbox" checked={state.remember} onChange={e=>setState({remember:e.target.checked})} />
                    <label htmlFor="remember_push">
                        <span className="ps-2">Remember</span>
                    </label>
                </div>
            </div>
        </div>
    </Modal.Body>
</Modal>
}

export const PushToModal = React.memo(PushToModalComponent);