import React, { useEffect } from "react"
import { Form, Modal } from "react-bootstrap";
import { useDispatch, shallowEqual } from "react-redux";
import { EnumModals, RepoUtils, useMultiState } from "../../lib";
import { ActionModals } from "../../store";
import { useSelectorTyped } from "../../store/rootReducer";

interface IState{
    branches:string[];
    searchText:string;
}

function CheckoutBranchModalComponent(){
    const dispatch = useDispatch();
    const store = useSelectorTyped(state=>({
        show:state.modal.openedModals.includes(EnumModals.CHECKOUT),
    }),shallowEqual)

    const [state,setState] = useMultiState<IState>({branches:[],searchText:""});

    useEffect(()=>{
        if(!store.show){
            setState({branches:[]});
            return;            
        }
        const branches = RepoUtils.repositoryDetails.branchList;
        setState({branches});
    },[store.show])

    const getBranchDisplayName = (branch:string)=>{
        const remotePrefix = 'remotes/';
        if(branch.startsWith(remotePrefix))
            return branch.substring(remotePrefix.length);
        return branch;
    }

    return <Modal show={store.show} size="sm" backdrop={false}>
        <Modal.Body>
            <div className="container">
                <div className="row g-0">
                    <div className="col-11">
                        <span className="text-success">Checkout</span>                        
                    </div>
                    <div className="col-1 text-end">
                        <span className="hover" onClick={_=> dispatch(ActionModals.hideModal(EnumModals.CHECKOUT))}>&times;</span>
                    </div>
                </div>
                <hr />
                <div className="row g-0">
                    <div className="col-12" style={{maxWidth:600,maxHeight:500}}>
                        <div className="w-100 position-relative">
                            <Form.Control type="text" value={state.searchText} onChange={e=> setState({searchText:e.target.value})} />
                            <div className="position-absolute bg-white border px-2 overflow-y-auto" 
                                style={{top:`110%`,left:0,minWidth:'100%',maxHeight:'75vh',maxWidth:500, overflowY:'auto'}}>
                                {
                                    state.branches.map(br=>(
                                        <div title={br} key={br} className="border-bottom py-1 hover overflow-hidden text-nowrap" style={{textOverflow:'ellipsis'}}>
                                            {getBranchDisplayName(br)}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal.Body>
    </Modal>
}

export const CheckoutBranchModal = React.memo(CheckoutBranchModalComponent);