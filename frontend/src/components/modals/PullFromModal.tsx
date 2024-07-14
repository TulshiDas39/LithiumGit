import React, { useEffect } from "react";
import { AppButton } from "../common";
import { Modal, Form } from "react-bootstrap";
import { shallowEqual, useDispatch } from "react-redux";
import { EnumModals, useMultiState, RepoUtils } from "../../lib";
import { IpcUtils } from "../../lib/utils/IpcUtils";
import { ActionModals, ActionSavedData } from "../../store";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionUI } from "../../store/slices/UiSlice";
import { FaTimes } from "react-icons/fa";
import { ModalData } from "./ModalData";
import { Messages } from "../../lib/constants";

interface IState{
    branch:string;
}

function PullFromModalComponent(){
    const store = useSelectorTyped(state=>({
        show:state.modal.openedModals.includes(EnumModals.PULL_FROM),        
    }),shallowEqual);

    const [state,setState] = useMultiState<IState>({
        branch:"",
    });

    const dispatch = useDispatch();

    const closeModal=()=>{
        dispatch(ActionModals.hideModal(EnumModals.PULL_FROM));
        clearState();
    }

    const clearState = ()=>{
        setState({branch:""});;
    }

    const handlePull=()=>{
        if(!state.branch)
            return ;
        const originName = RepoUtils.activeOriginName;
        const options = [originName,state.branch];
        dispatch(ActionUI.setLoader({text:Messages.pull}));
        IpcUtils.trigerPull(options).then((r)=>{
            if(!r.error){
                ModalData.appToast.message = "Pull succeeded.";
                dispatch(ActionModals.showModal(EnumModals.TOAST));
            }
            dispatch(ActionUI.setLoader(undefined));
            dispatch(ActionUI.setSync({text:Messages.getStatus}));
            IpcUtils.getRepoStatus().finally(()=>{                
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
        setState({branch:pullFromBranch});
    },[store.show])

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
                <div className="col-12 text-break overflow-auto" style={{maxWidth:600,maxHeight:500}}>
                    <Form.Control type="text" placeholder="Branch name" value={state.branch} onChange={e=>setState({branch:e.target.value})} />
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