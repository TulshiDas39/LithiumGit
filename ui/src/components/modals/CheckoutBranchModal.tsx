import React, { useEffect, useRef } from "react"
import { Form, Modal } from "react-bootstrap";
import { useDispatch, shallowEqual } from "react-redux";
import { EnumModals, RepoUtils, useMultiState } from "../../lib";
import { ActionModals } from "../../store";
import { useSelectorTyped } from "../../store/rootReducer";
import { AppButton } from "../common";
import { IpcUtils } from "../../lib/utils/IpcUtils";
import { FaTimes } from "react-icons/fa";
import { GitUtils } from "../../lib/utils/GitUtils";

interface IState{
    options:string[];
    searchText:string;
    showList:boolean;
    inputFocused:boolean;
    isSelected:boolean;
    branchList:string[];
}

function CheckoutBranchModalComponent(){
    const dispatch = useDispatch();
    const store = useSelectorTyped(state=>({
        show:state.modal.openedModals.includes(EnumModals.CHECKOUT),
    }),shallowEqual)

    const [state,setState] = useMultiState<IState>({
        options:[],
        searchText:"",
        inputFocused:true,
        showList:true,
        isSelected:false,
        branchList:[],
    });

    const refData = useRef({hoverOptions:false});

    const hideModal=()=>{
        dispatch(ActionModals.hideModal(EnumModals.CHECKOUT));
    }

    useEffect(()=>{
        if(!store.show){            
            return;            
        }
        const branches = RepoUtils.repositoryDetails?.branchList || [];
        setState({branchList:branches,isSelected:false,searchText:""});
    },[store.show])

    const getBranchDisplayName = (branch:string)=>{
        const remotePrefix = 'remotes/';
        if(branch.startsWith(remotePrefix))
            return branch.substring(remotePrefix.length);
        return branch;
    }

    const resolveOptions = ()=>{
        let branches = state.branchList.map(_=> getBranchDisplayName(_));
        if(!branches.length)
            return branches;
        if(branches.lastIndexOf(branches[0]) > 0 )
            branches = branches.slice(1);
        
        return branches;
    }

    useEffect(()=>{
        let branches:string[] = [];
        if(!state.isSelected && state.inputFocused){
            branches = branches = resolveOptions();
            if(state.searchText){            
                branches = branches.filter(_ => _?.toLowerCase().includes(state.searchText?.toLowerCase()));
            }
        }
        
        setState({options: branches});
    },[state.searchText,state.isSelected,state.branchList,state.inputFocused])    

    const handleSelect=(option:string)=>{
        setState({searchText:option,isSelected:true,inputFocused:false});
    }

    const checkout = ()=>{
        if(!state.searchText)
            return;
        const options = [state.searchText];
        IpcUtils.checkout(options).then(()=>{
            GitUtils.getStatus();
        });
        hideModal();
    }
    
    const handleBlur = ()=>{
        if(refData.current.hoverOptions)
            return;
        setState({inputFocused:false});
    }

    return <Modal show={store.show} size="sm" backdrop={false}>
        <Modal.Body>
            <div className="container">
                <div className="row g-0">
                    <div className="col-11">
                        <span className="text-success">Checkout</span>                        
                    </div>
                    <div className="col-1 text-end">
                        <span className="hover" onClick={_=> dispatch(ActionModals.hideModal(EnumModals.CHECKOUT))}><FaTimes /></span>
                    </div>
                </div>
                <hr />
                <div className="row g-0">
                    <div className="col-12" style={{maxWidth:600,maxHeight:500}}>
                        <div className="w-100 position-relative">
                            <Form.Control type="text" value={state.searchText} onChange={e=> setState({searchText:e.target.value,isSelected:false})}
                             autoFocus={true} onFocus={()=> setState({inputFocused:true})} onBlur={handleBlur} />
                            {!!state.options.length && <div className="position-absolute border px-2 overflow-y-auto" 
                                style={{top:`110%`,left:0,minWidth:'100%',maxHeight:'75vh',maxWidth:500, overflowY:'auto'}}
                                onMouseEnter={()=> {refData.current.hoverOptions = true}} onMouseLeave={()=>{refData.current.hoverOptions = false}}>
                                {
                                    state.options.map(br=>(
                                        <div title={br} key={br} className="border-bottom py-1 hover overflow-hidden text-nowrap" style={{textOverflow:'ellipsis'}}
                                            onClick={()=>handleSelect(br)}>
                                            {br}
                                        </div>
                                    ))
                                }
                            </div>}
                        </div>
                        <div className="w-100 d-flex justify-content-center pt-4">
                            <AppButton type="default" onClick={checkout}>Checkout</AppButton>
                        </div>
                    </div>
                </div>
            </div>
        </Modal.Body>
    </Modal>
}

export const CheckoutBranchModal = React.memo(CheckoutBranchModalComponent);