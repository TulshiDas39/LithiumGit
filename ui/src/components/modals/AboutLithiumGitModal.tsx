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

    return <Modal show={store.show} dialogClassName="createBranchModal" 
        centered backdropClassName="bg-transparent" animation={false} >
        <Modal.Body>
            <div className="row g-0 border-bottom align-items-center py-2">
                <div className="col-11">
                    Create new branch
                </div>
                <div className="col-1 text-end">
                    <span className="hover" onClick={_=> dispatch(ActionModals.hideModal(EnumModals.ABOUT_LITHIUMGIT))}><FaTimes className="" /></span>
                </div>
            </div>
            <div className="row g-0 py-3 align-items-center">
                <div className="col-auto">
                    Branch Name:
                </div>
                <div className="col">
                    {/* <Form.Control type="text" value={state.branchName} onChange={e=> setState({branchName:e.target.value})} /> */}
                </div>
            </div>
            <div className="row g-0 py-3 align-items-center">
                <div className="col-auto pe-2">
                    {/* <Form.Check id="create_branch" checked={state.checkout} onChange={_=> setState({checkout:!state.checkout})} /> */}
                </div>
                <div className="col-8">
                    <label htmlFor="create_branch">Checkout this branch</label>
                </div>
            </div>            
        </Modal.Body>
    </Modal>
}

export const AboutLithiumGitModal = React.memo(AboutLithiumGitModalComponent);