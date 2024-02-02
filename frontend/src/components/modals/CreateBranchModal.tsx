import { ICommitInfo, IStatus, RendererEvents } from "common_library";
import React, { useEffect } from "react"
import { Button, Form, Modal } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import { shallowEqual, useDispatch } from "react-redux";
import { BranchUtils, EnumModals, useMultiState } from "../../lib";
import { BranchGraphUtils } from "../../lib/utils/BranchGraphUtils";
import { ActionModals } from "../../store";
import { useSelectorTyped } from "../../store/rootReducer";
import { InitialModalData, ModalData } from "./ModalData";
import { IpcUtils } from "../../lib/utils/IpcUtils";

interface IState{
    branchName:string;
    checkout:boolean;
}

function CreateBranchModalComponent(){
    const Data = ModalData.createBranchModal;
    const dispatch = useDispatch();
    const store = useSelectorTyped(state=>({
        show:state.modal.openedModals.includes(EnumModals.CREATE_BRANCH),
    }),shallowEqual);

    const [state,setState]= useMultiState({branchName:"",checkout:true} as IState);

    useEffect(()=>{
        if(!store.show) {
            ModalData.createBranchModal = InitialModalData.createBranchModal;
            setState({
                branchName:"",
                checkout:true,
            })
        }
    },[store.show])

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.createBranch().replyChannel,(e,sourceCommit:ICommitInfo,branchName:string,status:IStatus,chckout:boolean)=>{
            BranchGraphUtils.handleNewBranch(sourceCommit,branchName,status);
        })
    },[])

    const handleBranchCreateClick=()=>{
        const branchNames = BranchUtils.getAllBranchNames();
        if(branchNames.includes(state.branchName)) return;
        IpcUtils.createBranch(state.branchName,Data.sourceCommit,state.checkout).then(_=>{
            IpcUtils.getRepoStatus();
        });        
        dispatch(ActionModals.hideModal(EnumModals.CREATE_BRANCH));
    }

    return <Modal show={store.show} dialogClassName="createBranchModal" 
        centered backdropClassName="bg-transparent" animation={false} >
        <Modal.Body>
            <div className="row g-0 border-bottom align-items-center py-2">
                <div className="col-11">
                    Create new branch
                </div>
                <div className="col-1 text-end">
                    <span className="hover" onClick={_=> dispatch(ActionModals.hideModal(EnumModals.CREATE_BRANCH))}><FaTimes className="" /></span>
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
            <div className="row g-0 py-3 align-items-center">
                <div className="col-auto pe-2">
                    <Form.Check id="create_branch" checked={state.checkout} onChange={_=> setState({checkout:!state.checkout})} />
                </div>
                <div className="col-8">
                    <label htmlFor="create_branch">Checkout this branch</label>
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