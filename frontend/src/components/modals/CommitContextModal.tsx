import { ICommitInfo, IStatus, RendererEvents } from "common_library";
import React, { useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { shallowEqual, useDispatch } from "react-redux";
import { BranchUtils, EnumModals, EnumSelectedRepoTab, ReduxUtils, UiUtils } from "../../lib";
import { BranchGraphUtils } from "../../lib/utils/BranchGraphUtils";
import { ActionModals } from "../../store";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionUI } from "../../store/slices/UiSlice";
import { InitialModalData, ModalData } from "./ModalData";

function CommitContextModalComponent(){
    const Data = ModalData.commitContextModal;
    const dispatch = useDispatch();
    const store = useSelectorTyped((state)=>({
        show:state.modal.openedModals.includes(EnumModals.COMMIT_CONTEXT),
        repo:state.savedData.recentRepositories.find(x=>x.isSelected),
    }),shallowEqual);

    const refData = useRef({mergerCommitMessage:""});

    useEffect(()=>{
        if(store.show){
            let elem = document.querySelector(".commitContext") as HTMLElement;
            if(elem){
                elem.style.marginTop = Data.position.y+"px";
                elem.style.marginLeft = Data.position.x+"px";
            }
        }
    },[store.show])

    const hideModal=()=>{
        ModalData.commitContextModal = InitialModalData.commitContextModal;
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
    }

    const checkOutCommit=()=>{
        const options:string[]=[];
        const canCheckoutBranch = BranchUtils.canCheckoutBranch(Data.selectedCommit);
        if(canCheckoutBranch) options.push(Data.selectedCommit.ownerBranch.name);
        else options.push(Data.selectedCommit.hash);
        window.ipcRenderer.send(RendererEvents.checkoutCommit().channel,BranchUtils.repositoryDetails.repoInfo,options)
        hideModal();
    }
    const handleCreateNewBranchClick=()=>{
        ModalData.createBranchModal.sourceCommit = Data.selectedCommit;
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        dispatch(ActionModals.showModal(EnumModals.CREATE_BRANCH));
    }

    const handleMerge=()=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        const sourceCommit = Data.selectedCommit;
        let source = sourceCommit.hash;
        refData.current.mergerCommitMessage = BranchUtils.generateMergeCommit()!;
        if(BranchUtils.HasBranchNameRef(sourceCommit)){
            source = sourceCommit.ownerBranch.name;
        }
        const options = [source,"--no-commit","--no-ff"];
        window.ipcRenderer.send(RendererEvents.gitMerge().channel,BranchUtils.repositoryDetails.repoInfo,options);
    }
    useEffect(()=>{
        const modalOpenEventListener = ()=>{
            dispatch(ActionModals.showModal(EnumModals.COMMIT_CONTEXT));
        }

        BranchGraphUtils.openContextModal = modalOpenEventListener;
        
        const listener = (_e:any,status:IStatus)=>{
            //UiUtils.updateHeadCommit(commit);
            
            BranchGraphUtils.handleCheckout(Data.selectedCommit,BranchUtils.repositoryDetails,status);            
            // SelectedRepoRightData.handleRepoDetailsUpdate(newRepoDetails);
            
        }
        window.ipcRenderer.on(RendererEvents.checkoutCommit().replyChannel,listener);

        const mergeListener = (e:any,status:IStatus)=>{
            dispatch(ActionUI.setLoader())
            dispatch(ActionUI.setMergerCommitMessage(refData.current.mergerCommitMessage));
            if(status) {
                ReduxUtils.setStatus(status);
                dispatch(ActionUI.setSelectedRepoTab(EnumSelectedRepoTab.CHANGES));
            }
        }

        window.ipcRenderer.on(RendererEvents.gitMerge().replyChannel,mergeListener)
        
        return ()=>{
            UiUtils.removeIpcListeners([
                RendererEvents.checkoutCommit().replyChannel,
                RendererEvents.gitMerge().replyChannel,
            ],[listener,mergeListener]);
        }

    },[])

    return (
        <Modal dialogClassName="commitContext"  size="sm" backdropClassName="bg-transparent" animation={false} show={store.show} onHide={()=> hideModal()}>
            <Modal.Body>
                <div className="container">
                    <div className="row g-0 border-bottom">
                        <div className="col-12 hover cur-default " onClick={checkOutCommit}>Checkout this commit</div> 
                    </div>
                    <div className="row g-0 border-bottom">
                        <div className="col-12 hover cur-default " onClick={handleCreateNewBranchClick}>Create branch from this commit</div>
                    </div>
                    <div>
                        <div className="col-12 hover cur-default " onClick={handleMerge}>Merge from this commit</div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export const CommitContextModal = React.memo(CommitContextModalComponent);