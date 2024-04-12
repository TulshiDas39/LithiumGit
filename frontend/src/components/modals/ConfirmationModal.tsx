import React, { useEffect } from "react"
import { Button, Modal } from "react-bootstrap";
import { useDispatch, shallowEqual } from "react-redux";
import { EnumModals } from "../../lib";
import { ActionModals } from "../../store";
import { useSelectorTyped } from "../../store/rootReducer";
import { ModalData, InitialModalData } from "./ModalData";
import { AppButton } from "../common";
import { FaTimes } from "react-icons/fa";

function ConfirmationModalComponent(){
    const Data = ModalData.confirmationModal;
    const dispatch = useDispatch();
    const store = useSelectorTyped(state=>({
        show:state.modal.openedModals.includes(EnumModals.CONFIRMATION),
    }),shallowEqual)

    useEffect(()=>{
        if(!store.show){
            ModalData.errorModal = InitialModalData.confirmationModal;
        }
    },[store.show])

    const handleYesClick =()=>{
        dispatch(ActionModals.hideModal(EnumModals.CONFIRMATION));
        Data.YesHandler();
    }

    const handleNoClick =()=>{
        dispatch(ActionModals.hideModal(EnumModals.CONFIRMATION));
        Data.NoHandler();
    }

    return <Modal show={store.show} centered size="sm" backdrop={false}>
        <Modal.Body>
            <div className="container">
                <div className="row g-0">
                    <div className="col-11">
                        <span className="text-info">Confirm</span>                        
                    </div>
                    <div className="col-1 text-end">
                        <span className="hover" onClick={handleNoClick}><FaTimes /></span>
                    </div>
                </div>
                <hr />
                <div className="row g-0">
                    <div className="col-12">
                        {Data.message || "Please confirm."}
                    </div>
                </div>
                <div className="row g-0 pt-3">
                    <div className="col"></div>
                    <div className="col-auto">
                        <AppButton text="Yes" type="default" onClick={handleYesClick} />
                    </div>
                    <div className="col-auto ps-2">
                        <AppButton text="No" type="default" onClick={handleNoClick } />
                    </div>
                </div>
            </div>
        </Modal.Body>
    </Modal>
}

export const ConfirmationModal = React.memo(ConfirmationModalComponent);