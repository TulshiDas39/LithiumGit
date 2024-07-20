import { EnumChangeGroup, IStatus, RendererEvents } from "common_library";
import React, { Fragment, useEffect, useMemo, useRef } from "react";
import { Modal } from "react-bootstrap";
import { shallowEqual, useDispatch } from "react-redux";
import { FaCodeBranch, FaRegPaperPlane } from "react-icons/fa";
import { EnumModals, EnumSelectedRepoTab, GraphUtils, IPositition, ReduxUtils, RepoUtils, UiUtils, useMultiState } from "../../../lib";
import { GitUtils } from "../../../lib/utils/GitUtils";
import { IpcUtils } from "../../../lib/utils/IpcUtils";
import { ActionModals, ActionChanges } from "../../../store";
import { useSelectorTyped } from "../../../store/rootReducer";
import { ActionUI } from "../../../store/slices/UiSlice";
import { ModalData, InitialModalData } from "../ModalData";
import { Option} from "./ContextData";
import { Checkout } from "./Checkout";
import { CreateBranch } from "./CreateBranch";
import { MergeBranch } from "./MergeBranch";


interface IState{
    mouseOver?:Option;
    showMore:boolean;
    position:IPositition;
}

function CommitContextModalComponent(){
    const Data = ModalData.commitContextModal;
    const dispatch = useDispatch();
    const store = useSelectorTyped((state)=>({
        show:state.modal.openedModals.includes(EnumModals.COMMIT_CONTEXT),
        repo:state.savedData.recentRepositories.find(x=>x.isSelected),
    }),shallowEqual);
    
    const [state, setState] = useMultiState({showMore:false} as IState);

    const refData = useRef({mergerCommitMessage:"",onHover:false,show:false});

    useEffect(()=>{
        refData.current.show = store.show;
        if(store.show){
            let elem = document.querySelector(".commitContext") as HTMLElement;
            if(elem){
                elem.style.marginTop = state.position.y+"px";
                elem.style.marginLeft = state.position.x+"px";
            }
        }
        else{
            setState({showMore:false});
        }
    },[store.show,state.position])

    const hideModal=()=>{
        ModalData.commitContextModal = InitialModalData.commitContextModal;
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
    }

    const checkOutCommit=(destination:string)=>{
        const options:string[]=[destination];
        IpcUtils.checkout(options).then(()=>{
            IpcUtils.getRepoStatusSync().then(status=>{
                GraphUtils.handleCheckout(Data.selectedCommit,status);            
            })
        });
        hideModal();
    }
    const handleCreateNewBranchClick=()=>{
        ModalData.createBranchModal.sourceCommit = Data.selectedCommit;
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        dispatch(ActionModals.showModal(EnumModals.CREATE_BRANCH));
    }

    const mergeCommit=(hash:string)=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        refData.current.mergerCommitMessage = RepoUtils.generateMergeCommitMessage(hash)!;      
        const options = [hash,"--no-commit","--no-ff"];
        IpcUtils.merge(options).then((r)=>{            
            GitUtils.getStatus().then(r=>{
                dispatch(ActionUI.setSelectedRepoTab(EnumSelectedRepoTab.CHANGES));
                if(r.conflicted?.length){
                    dispatch(ActionChanges.updateData({selectedTab:EnumChangeGroup.CONFLICTED}));
                }
                else if(r.staged?.length){
                    dispatch(ActionChanges.updateData({selectedTab:EnumChangeGroup.STAGED}));
                }
            });
        });        
    }

    const cherryPick=()=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));        
        const options = [Data.selectedCommit.hash];
        IpcUtils.cherryPick(options).then(r=>{
            GitUtils.getStatus().then(r=>{
                if(r.conflicted?.length){
                    dispatch(ActionUI.setSelectedRepoTab(EnumSelectedRepoTab.CHANGES));
                    dispatch(ActionChanges.updateData({selectedTab:EnumChangeGroup.CONFLICTED}));
                }
            });
        }).catch(e=>{
            const message = e?.toString() || "Failed to perform cherry-pick.";
            ModalData.errorModal.message = message;
            dispatch(ActionModals.showModal(EnumModals.ERROR));
        });
    }

    const mergeBranch=(branch:string)=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        refData.current.mergerCommitMessage = RepoUtils.generateMergeBranchMessage(branch)!;      
        const options = [branch,"--no-commit","--no-ff"];
        IpcUtils.merge(options).then(()=>{
            GitUtils.getStatus().then((r)=>{
                dispatch(ActionUI.setSelectedRepoTab(EnumSelectedRepoTab.CHANGES));
                if(r.conflicted?.length){
                    dispatch(ActionChanges.updateData({selectedTab:EnumChangeGroup.CONFLICTED}));
                }
                else if(r.staged?.length){
                    dispatch(ActionChanges.updateData({selectedTab:EnumChangeGroup.STAGED}));
                }
            });
        })
    }

    const rebaseBranch=(branch:string)=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        IpcUtils.rebaseBranch(branch).then(_=>{
            GitUtils.getStatus();
        }).catch(e=>{
            ModalData.errorModal.message = e?.toString() || "Failed to rebase.";
            dispatch(ActionModals.showModal(EnumModals.ERROR));
        })        
    }

    useEffect(()=>{
        const modalOpenEventListener = ()=>{
            setState({position:Data.position});
            dispatch(ActionModals.showModal(EnumModals.COMMIT_CONTEXT));
        }

        GraphUtils.openContextModal = modalOpenEventListener;                

        const mergeListener = (e:any,status:IStatus)=>{
            dispatch(ActionUI.setLoader())
            dispatch(ActionUI.setMergerCommitMessage(refData.current.mergerCommitMessage));
            if(status) {
                ReduxUtils.setStatus(status);
                dispatch(ActionUI.setSelectedRepoTab(EnumSelectedRepoTab.CHANGES));
            }
        }

        window.ipcRenderer.on(RendererEvents.gitMerge().replyChannel,mergeListener)
        document.addEventListener("click",(e)=>{
            if(refData.current.show && !refData.current.onHover){
                hideModal();
            }
        })
        return ()=>{
            UiUtils.removeIpcListeners([
                RendererEvents.gitMerge().replyChannel,
            ],[mergeListener]);
        }

    },[])

    const referredLocalBranches = useMemo(()=>{
        if(!store.show || !Data.selectedCommit?.refValues.length)
            return [];        
        const branchList = RepoUtils.repositoryDetails.branchList;
        const referredBranches = Data.selectedCommit.refValues.filter(_=> branchList.includes(_));
        return referredBranches;
    },[store.show,Data.selectedCommit])
    
    const branchNamesForCheckout = useMemo(()=>{
        if(!store.show || !Data.selectedCommit?.refValues.length)
            return [];
        const branches = referredLocalBranches.slice();
        for(let ref of Data.selectedCommit.refValues){
            if(!RepoUtils.isOriginBranch(ref) || RepoUtils.hasLocalBranch(ref))
                continue;
            const localBranch = RepoUtils.getLocalBranch(ref);
            if(localBranch)
                branches.push(localBranch);
        }
        return branches;
    },[referredLocalBranches,store.show,Data.selectedCommit])

    const branchNamesForDelete = useMemo(()=>{
        if(!store.show || !Data.selectedCommit?.refValues.length)
            return [];
        const branches = referredLocalBranches.slice();        
        return branches;
    },[referredLocalBranches,store.show,Data.selectedCommit])

    const softReset=()=>{
        hideModal();
        const options:string[]=["--soft","HEAD~1"];
        IpcUtils.reset(options).then(r=>{
            GitUtils.getStatus();
        })
    }

    const hardReset=()=>{
        hideModal();
        const handler = ()=>{
            const options:string[]=["--hard","HEAD~1"];
            IpcUtils.reset(options).then(r=>{
                GitUtils.getStatus();
            })
        }
        ModalData.confirmationModal.YesHandler = handler;
        ModalData.confirmationModal.message = `Hard reset ${Data.selectedCommit.avrebHash}?`;
        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));        
    }

    const deleteBranch=(branchName:string)=>{
        hideModal();
        const handler = ()=>{
            IpcUtils.getRaw(["branch","-D",branchName]).then(r=>{
                if(r.result){
                    dispatch(ActionUI.increamentVersion("branchPanelRefresh"));
                }
            })
        }
        ModalData.confirmationModal.YesHandler = handler;
        ModalData.confirmationModal.message = `Delete local branch '${branchName}'?`;
        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));        
    }

    const moreOptionList = useMemo(()=>{
        const options:Option[] = [];
        if(!store.show)
            return options;
        if(!Data.selectedCommit?.nextCommit && Data.selectedCommit?.isHead){
            options.push(Option.HardReset,Option.SoftReset);
        }
        if(branchNamesForDelete.length){
            options.push(Option.DeleteBranch);
        }
        return options;
    },[store.show,Data.selectedCommit])

    const optionClasses = "border-bottom context-option";

    return (
        <Modal dialogClassName="commitContext" className="context-modal" backdrop={false}  size="sm" backdropClassName="bg-transparent" animation={false} show={store.show} onHide={()=> hideModal()}>
            <Modal.Body onMouseEnter={()=> {refData.current.onHover = true}} onMouseLeave={()=>{refData.current.onHover = false}}>
                <div className="container" onMouseLeave={() => setState({mouseOver:undefined})}>
                    <Checkout hideModal={()=>hideModal()} mouseOver={state.mouseOver} onMouseHover={(op) => setState({mouseOver:op})} />
                    <CreateBranch hideModal={() => hideModal()} onMouseHover={(o)=> setState({mouseOver:o})} />
                    <MergeBranch hideModal={()=> hideModal()} onMouseHover={(op) => setState({mouseOver:op})} referredLocalBranches={referredLocalBranches} mouseOver={state.mouseOver} />

                    {
                        !Data.selectedCommit?.isHead && referredLocalBranches.length > 0 &&
                            <div className={`row g-0 ${optionClasses}`}>
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
                    }

                    {!Data.selectedCommit?.isHead && <div className={`row g-0 ${optionClasses}`} onMouseEnter={()=> setState(({mouseOver:null!}))}>
                        <div className="col-12 hover cur-default " onClick={cherryPick}>
                            Cherry-Pick this commit <FaRegPaperPlane />
                        </div>
                    </div>}
                    {!!moreOptionList.length && !state.showMore && <div className={`row g-0 ${optionClasses}`} onMouseEnter={()=> setState(({mouseOver:null!}))}
                        onClick={_=> setState({showMore:true})}>
                        <div className="col-12 hover cur-default ">Show More</div>
                    </div>}
                    {
                        state.showMore && <Fragment>                        
                            {moreOptionList.includes(Option.SoftReset) && <div className={`row g-0 ${optionClasses}`} onMouseEnter={()=> setState(({mouseOver:null!}))}>
                                <div className="col-12 hover cur-default " onClick={softReset}>Soft reset this commit</div>
                            </div>}
                            {moreOptionList.includes(Option.HardReset) && <div className={`row g-0 ${optionClasses}`} onMouseEnter={()=> setState(({mouseOver:null!}))}>
                                <div className="col-12 hover cur-default " onClick={hardReset}>Hard reset this commit</div>
                            </div>}                        
                            {
                            moreOptionList.includes(Option.DeleteBranch) && 
                            <div className={`row g-0 ${optionClasses}`}>
                                {
                                    branchNamesForDelete.length > 1 ? <div className="col-12 cur-default position-relative">
                                        <div className="d-flex hover" onMouseEnter={()=> setState(({mouseOver:Option.DeleteBranch}))}>
                                            <span className="flex-grow-1 text-danger">Delete branch</span>
                                            <span>&gt;</span>
                                        </div>
                                        
                                        {(state.mouseOver === Option.DeleteBranch) && <div className="position-absolute border bg-white" style={{left:'100%',top:0}}>
                                            {
                                                branchNamesForDelete.map((br=>(
                                                    <div key={br} className="border-bottom py-1 px-3 ">
                                                        <span className="hover" onClick={() => deleteBranch(br)}>{br}</span>
                                                    </div>
                                                )))
                                            }
                                        </div>}
                                    </div>:
                                    <div className="col-12 hover cur-default text-danger" onClick={() => deleteBranch(branchNamesForDelete[0])}>Delete branch '{branchNamesForDelete[0]}'</div>
                                }                                
                            </div>
                    }
                        
                        </Fragment>
                    }
                                 
                </div>
            </Modal.Body>
        </Modal>
    )
}

export const CommitContextModal2 = React.memo(CommitContextModalComponent);