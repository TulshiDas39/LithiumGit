import React, { useEffect } from "react"
import { Modal } from "react-bootstrap"
import { shallowEqual, useDispatch } from "react-redux";
import { EnumModals } from "../../lib";
import { ActionModals } from "../../store";
import { useSelectorTyped } from "../../store/rootReducer";
import { InitialModalData, ModalData } from "./ModalData";
import { FaTimes } from "react-icons/fa";

function ErrorModalComponent(){
    const Data = ModalData.errorModal;
    const dispatch = useDispatch();
    const store = useSelectorTyped(state=>({
        show:state.modal.openedModals.includes(EnumModals.ERROR),
    }),shallowEqual)

    useEffect(()=>{
        if(!store.show){
            ModalData.errorModal = InitialModalData.errorModal;
        }
    },[store.show])

    return <Modal show={store.show} centered size="sm" backdrop={false}>
        <Modal.Body>
            <div className="container">
                <div className="row g-0">
                    <div className="col-11">
                        <span className="text-danger">Error</span>                        
                    </div>
                    <div className="col-1 text-end">
                        <span className="hover" onClick={_=> dispatch(ActionModals.hideModal(EnumModals.ERROR))}><FaTimes /></span>
                    </div>
                </div>
                <hr />
                <div className="row g-0">
                    <div className="col-12 text-break overflow-auto" style={{maxWidth:600,maxHeight:500}}>
                        {Data.message}
                    </div>
                </div>
            </div>
        </Modal.Body>
    </Modal>
}

export const ErrorModal = React.memo(ErrorModalComponent);