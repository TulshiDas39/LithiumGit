import { ICommitInfo, IStatus, RendererEvents } from "common_library";
import React, { useEffect, useMemo, useRef } from "react";
import { Modal } from "react-bootstrap";
import { shallowEqual, useDispatch } from "react-redux";
import { BranchUtils, EnumModals, EnumSelectedRepoTab, ReduxUtils, UiUtils, useMultiState } from "../../lib";
import { BranchGraphUtils } from "../../lib/utils/BranchGraphUtils";
import { ActionModals } from "../../store";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionUI } from "../../store/slices/UiSlice";
import { InitialModalData, ModalData } from "./ModalData";
import { IpcUtils } from "../../lib/utils/IpcUtils";

enum Option{
    Checkout,
    Merge,
    Rebase,
    CherryPick,
}

interface IState{
    mouseOver?:Option;
}

function CommitContextModalComponent(){
    const Data = ModalData.commitContextModal;
    const dispatch = useDispatch();
    const store = useSelectorTyped((state)=>({
        show:state.modal.openedModals.includes(EnumModals.COMMIT_CONTEXT),
        repo:state.savedData.recentRepositories.find(x=>x.isSelected),
    }),shallowEqual);
    
    const [state, setState] = useMultiState({} as IState);

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

    const checkOutCommit=(destination:string)=>{
        const options:string[]=[destination];
        //const canCheckoutBranch = BranchUtils.canCheckoutBranch(Data.selectedCommit);
        //if(canCheckoutBranch) options.push(Data.selectedCommit.ownerBranch.name);        
        window.ipcRenderer.send(RendererEvents.checkoutCommit().channel,BranchUtils.repositoryDetails.repoInfo,options)
        hideModal();
    }
    const handleCreateNewBranchClick=()=>{
        ModalData.createBranchModal.sourceCommit = Data.selectedCommit;
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        dispatch(ActionModals.showModal(EnumModals.CREATE_BRANCH));
    }

    const mergeCommit=(hash:string)=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        refData.current.mergerCommitMessage = BranchUtils.generateMergeCommitMessage(hash)!;      
        const options = [hash,"--no-commit","--no-ff"];
        window.ipcRenderer.send(RendererEvents.gitMerge().channel,BranchUtils.repositoryDetails.repoInfo,options);
    }

    const cherryPick=()=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));        
        const options = [Data.selectedCommit.hash];
        IpcUtils.cherryPick(options).then(r=>{
            IpcUtils.getRepoStatus();
        });
    }

    const mergeBranch=(branch:string)=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        refData.current.mergerCommitMessage = BranchUtils.generateMergeBranchMessage(branch)!;      
        const options = [branch,"--no-commit","--no-ff"];
        window.ipcRenderer.send(RendererEvents.gitMerge().channel,BranchUtils.repositoryDetails.repoInfo,options);
    }

    const rebaseBranch=(branch:string)=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        IpcUtils.rebaseBranch(branch).then(_=>{
            IpcUtils.getRepoStatus();
        }).catch(e=>{
            ModalData.errorModal.message = e?.toString() || "Failed to rebase.";
            dispatch(ActionModals.showModal(EnumModals.ERROR));
        })        
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

    const referredLocalBranches = useMemo(()=>{
        if(!store.show || !Data.selectedCommit?.refValues.length)
            return [];        
        const branchList = BranchUtils.repositoryDetails.branchList;
        const referredBranches = Data.selectedCommit.refValues.filter(_=> branchList.includes(_));
        return referredBranches;
    },[store.show])
    
    const branchNamesForCheckout = useMemo(()=>{
        if(!store.show || !Data.selectedCommit?.refValues.length)
            return [];
        const branches = referredLocalBranches.slice();
        for(let ref of Data.selectedCommit.refValues){
            if(!BranchUtils.isOriginBranch(ref) || BranchUtils.hasLocalBranch(ref))
                continue;
            const localBranch = BranchUtils.getLocalBranch(ref);
            if(localBranch)
                branches.push(localBranch);
        }
        return branches;
    },[referredLocalBranches,store.show])

    return (
        <Modal dialogClassName="commitContext"  size="sm" backdropClassName="bg-transparent" animation={false} show={store.show} onHide={()=> hideModal()}>
            <Modal.Body>
                <div className="container" onMouseLeave={() => setState({mouseOver:undefined})}>
                    {
                        branchNamesForCheckout.length > 0 && <div>
                            <div className="row g-0 border-bottom">
                                {
                                    branchNamesForCheckout.length > 1 ? <div className="col-12 cur-default position-relative">
                                        <div className="d-flex hover" onMouseEnter={()=> setState(({mouseOver:Option.Checkout}))}>
                                            <span className="flex-grow-1">Checkout branch</span>
                                            <span>&gt;</span>
                                        </div>
                                        
                                        {(state.mouseOver === Option.Checkout) && <div className="position-absolute border bg-white" style={{left:'100%',top:0}}>
                                            {
                                                branchNamesForCheckout.map((br=>(
                                                    <div key={br} className="border-bottom py-1 px-3">
                                                        <span className="hover" onClick={() => checkOutCommit(br)}>{br}</span>
                                                    </div>
                                                )))
                                            }
                                        </div>}
                                    </div>:
                                    <div className="col-12 hover cur-default " onClick={() => checkOutCommit(branchNamesForCheckout[0])}>Checkout branch '{branchNamesForCheckout[0]}'</div>
                                }                                
                            </div>
                        </div>
                    }

                    <div className="row g-0 border-bottom" onMouseEnter={()=> setState(({mouseOver:null!}))}>
                        <div className="col-12 hover cur-default " onClick={()=>checkOutCommit(Data.selectedCommit.hash)}>Checkout this commit</div> 
                    </div>
                    <div className="row g-0 border-bottom" onMouseEnter={()=> setState(({mouseOver:null!}))}>
                        <div className="col-12 hover cur-default " onClick={handleCreateNewBranchClick}>Create branch from this commit</div>
                    </div>
                    {
                        !Data.selectedCommit?.isHead && referredLocalBranches.length > 0 && <div>
                            <div className="row g-0 border-bottom">
                                {
                                    referredLocalBranches.length > 1 ? <div className="col-12 cur-default position-relative">
                                        <div className="d-flex hover" onMouseEnter={()=> setState(({mouseOver:Option.Merge}))}>
                                            <span className="flex-grow-1">Merge branch</span>
                                            <span>&gt;</span>
                                        </div>
                                        
                                        {(state.mouseOver === Option.Merge) && <div className="position-absolute border bg-white" style={{left:'100%',top:0}}>
                                            {
                                                referredLocalBranches.map((br=>(
                                                    <div key={br} className="border-bottom py-1 px-3">
                                                        <span className="hover" onClick={() => mergeBranch(br)}>{br}</span>
                                                    </div>
                                                )))
                                            }
                                        </div>}
                                    </div>:
                                    <div className="col-12 hover cur-default " onClick={() => mergeBranch(referredLocalBranches[0])}>Merge branch '{referredLocalBranches[0]}'</div>
                                }                                
                            </div>
                        </div>
                    }
                    {!Data.selectedCommit?.isHead && <div className="border-bottom" onMouseEnter={()=> setState(({mouseOver:null!}))}>
                        <div className="col-12 hover cur-default " onClick={()=>mergeCommit(Data.selectedCommit?.hash)}>Merge this commit</div>
                    </div>}

                    {
                        !Data.selectedCommit?.isHead && referredLocalBranches.length > 0 && <div>
                            <div className="row g-0 border-bottom">
                                {
                                    referredLocalBranches.length > 1 ? <div className="col-12 cur-default position-relative">
                                        <div className="d-flex hover" onMouseEnter={()=> setState(({mouseOver:Option.Merge}))}>
                                            <span className="flex-grow-1">Rebase branch</span>
                                            <span>&gt;</span>
                                        </div>
                                        
                                        {(state.mouseOver === Option.Rebase) && <div className="position-absolute border bg-white" style={{left:'100%',top:0}}>
                                            {
                                                referredLocalBranches.map((br=>(
                                                    <div key={br} className="border-bottom py-1 px-3">
                                                        <span className="hover" onClick={() => rebaseBranch(br)}>{br}</span>
                                                    </div>
                                                )))
                                            }
                                        </div>}
                                    </div>:
                                    <div className="col-12 hover cur-default " onClick={() => rebaseBranch(referredLocalBranches[0])}>Rebase branch '{referredLocalBranches[0]}'</div>
                                }                                
                            </div>
                        </div>
                    }

                    {!Data.selectedCommit?.isHead && <div className="row g-0 border-bottom" onMouseEnter={()=> setState(({mouseOver:null!}))}>
                        <div className="col-12 hover cur-default " onClick={cherryPick}>Cherry-Pick this commit</div>
                    </div>}
                </div>
            </Modal.Body>
        </Modal>
    )
}

export const CommitContextModal = React.memo(CommitContextModalComponent);