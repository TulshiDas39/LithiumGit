import { ICommitInfo, IStatus, RendererEvents } from "common_library";
import React, { useEffect } from "react"
import { Button, Form, Modal } from "react-bootstrap";
import { shallowEqual, useDispatch } from "react-redux";
import { BranchUtils, EnumModals, useMultiState } from "../../lib";
import { BranchGraphUtils } from "../../lib/utils/BranchGraphUtils";
import { ActionModals } from "../../store";
import { useSelectorTyped } from "../../store/rootReducer";
import { InitialModalData, ModalData } from "./ModalData";

interface IState{
    branchName:string;
}

function CreateBranchModalComponent(){
    const Data = ModalData.createBranchModal;
    const dispatch = useDispatch();
    const store = useSelectorTyped(state=>({
        show:state.modal.openedModals.includes(EnumModals.CREATE_BRANCH),
    }),shallowEqual);

    const [state,setState]= useMultiState({branchName:""} as IState);

    useEffect(()=>{
        if(!store.show) {
            ModalData.createBranchModal = InitialModalData.createBranchModal;
            setState({
                branchName:"",
            })
        }
    },[store.show])

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.createBranch().replyChannel,(e,sourceCommit:ICommitInfo,branchName:string,status:IStatus)=>{
            BranchGraphUtils.handleNewBranch(sourceCommit,branchName,status);
        })
    },[])

    const handleBranchCreateClick=()=>{
        const branchNames = BranchUtils.getAllBranchNames();
        console.log("branchnames",branchNames);
        if(branchNames.includes(state.branchName)) return;
        console.log('creating branch');
        window.ipcRenderer.send(RendererEvents.createBranch().channel,Data.sourceCommit,BranchUtils.repositoryDetails,state.branchName);
        dispatch(ActionModals.hideModal(EnumModals.CREATE_BRANCH));
    }

    return <Modal show={store.show} dialogClassName="createBranchModal" 
        centered backdropClassName="bg-transparent" animation={false} >
        <Modal.Body>
            <div className="row g-0 border-bottom align-items-center">
                <div className="col-11">
                    Create new branch
                </div>
                <div className="col-1 text-end">
                    <span className="hover" onClick={_=> dispatch(ActionModals.hideModal(EnumModals.CREATE_BRANCH))}>&times;</span>
                </div>
            </div>
            <div className="row g-0 py-3 align-items-center">
                <div className="col-auto">
                    Branch Name:
                </div>
                <div className="col">
                    <Form.Control type="text" value={state.branchName} onChange={e=> setState({branchName:e.target.value})} />
                </div>
            </div>
            <div className="row g-0 py-3">
                <div className="col-12 text-end">
                    <Button variant="primary" onClick={_=> handleBranchCreateClick() }
                        disabled={!state.branchName}>Create branch</Button>
                </div>
            </div>
        </Modal.Body>
    </Modal>
}

export const CreateBranchModal = React.memo(CreateBranchModalComponent);