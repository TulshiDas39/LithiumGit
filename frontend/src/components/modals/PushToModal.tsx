import { Form, Modal } from "react-bootstrap";
import { useSelectorTyped } from "../../store/rootReducer";
import { RepoUtils, EnumModals, useMultiState } from "../../lib";
import { shallowEqual, useDispatch } from "react-redux";
import { ActionModals, ActionSavedData } from "../../store";
import React, { useEffect } from "react";
import { AppButton } from "../common";
import { IpcUtils } from "../../lib/utils/IpcUtils";
import { ActionUI } from "../../store/slices/UiSlice";
import { FaTimes } from "react-icons/fa";

interface IState{
    branch:string;
}

function PushToModalComponent(){
    const store = useSelectorTyped(state=>({
        show:state.modal.openedModals.includes(EnumModals.PUSH_TO),        
    }),shallowEqual);

    const [state,setState] = useMultiState<IState>({
        branch:"",
    });

    const dispatch = useDispatch();

    const closeModal=()=>{
        dispatch(ActionModals.hideModal(EnumModals.PUSH_TO));
        clearState();
    }

    const clearState = ()=>{
        setState({branch:""});;
    }

    const handlePush=()=>{
        if(!state.branch)
            return ;
        closeModal();
        const originName = RepoUtils.activeOriginName;
        const options = [originName,state.branch];
        dispatch(ActionUI.setLoader({text:"Push in progress..."}));
        IpcUtils.trigerPush(options).then(()=>{
            IpcUtils.getRepoStatus().finally(()=>{                
                dispatch(ActionUI.setLoader(undefined));
            })
        }).finally(()=>{
            const newPushTo = state.branch;
            const repo = RepoUtils.repositoryDetails.repoInfo;
            if(newPushTo !== repo?.pushToBranch){            
                repo.pushToBranch = newPushTo;
                dispatch(ActionSavedData.updateRepository(repo));
            }
        })
        
    }

    useEffect(()=>{
        if(!store.show)
            return ;
        const pushToBranch = RepoUtils.repositoryDetails.repoInfo.pushToBranch || "";
        setState({branch:pushToBranch});
    },[store.show])

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
                <div className="col-12 text-break overflow-auto" style={{maxWidth:600,maxHeight:500}}>
                    <Form.Control type="text" placeholder="Branch name" value={state.branch} onChange={e=>setState({branch:e.target.value})} />
                </div>
            </div>
            <div className="row g-0">
                <div className="col-12 pt-2 text-break overflow-auto d-flex align-items-center justify-content-center" style={{maxWidth:600,maxHeight:500}}>
                    <AppButton text="Push" type="success" onClick={handlePush} />
                </div>
            </div>            
        </div>
    </Modal.Body>
</Modal>
}

export const PushToModal = React.memo(PushToModalComponent);