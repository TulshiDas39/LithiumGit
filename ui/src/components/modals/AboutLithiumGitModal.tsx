import { Modal } from "react-bootstrap";
import { EnumModals } from "../../lib";
import { useSelectorTyped } from "../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { ActionModals } from "../../store";
import { FaTimes } from "react-icons/fa";
import React from "react";

function AboutLithiumGitModalComponent() {
    const store = useSelectorTyped(state => ({
        show: state.modal.openedModals.includes(EnumModals.ABOUT_LITHIUMGIT),
    }), shallowEqual);

    const dispatch = useDispatch();

    return <Modal show={store.show} dialogClassName="" 
        backdropClassName="bg-transparent" animation={false} size="lg" >
        <Modal.Body>
            <div className="row g-0 border-bottom align-items-center py-2">
                <div className="col-11">
                    About
                </div>
                <div className="col-1 text-end">
                    <span className="hover" onClick={_=> dispatch(ActionModals.hideModal(EnumModals.ABOUT_LITHIUMGIT))}><FaTimes className="" /></span>
                </div>
            </div>
            <div className="row g-0 py-3 align-items-center">
                <div className="col-2">
                    <div className="py-2 ps-2 pe-4 bg-third-color border-bottom cur-default hover">About</div>
                    <div className="py-2 ps-2 pe-4 bg-third-color cur-default hover">What's new?</div>
                </div>
                <div className="col-10">
                    
                </div>
            </div>           
        </Modal.Body>
    </Modal>
}

export const AboutLithiumGitModal = React.memo(AboutLithiumGitModalComponent);