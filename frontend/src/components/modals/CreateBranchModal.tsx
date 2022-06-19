import React, { useEffect } from "react"
import { Button, Form, Modal } from "react-bootstrap";
import { shallowEqual, useDispatch } from "react-redux";
import { EnumModals, useMultiState } from "../../lib";
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
        if(!store.show) ModalData.createBranchModal = InitialModalData.createBranchModal;
    },[store.show])

    const handleBranchCreateClick=()=>{

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