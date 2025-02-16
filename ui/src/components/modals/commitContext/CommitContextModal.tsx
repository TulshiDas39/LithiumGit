import React, { useEffect, useMemo, useRef } from "react";
import { Modal } from "react-bootstrap";
import { shallowEqual, useDispatch } from "react-redux";
import { EnumModals, GraphUtils, IPositition, RepoUtils, UiUtils, useMultiState } from "../../../lib";
import { ActionModals } from "../../../store";
import { useSelectorTyped } from "../../../store/rootReducer";
import { ModalData, InitialModalData } from "../ModalData";
import { Option} from "./ContextData";
import { CommitOptions } from "./CommitOptions";
import { MeregingCommitOptions } from "./MeregingCommitOptions";


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

    useEffect(()=>{
        const modalOpenEventListener = ()=>{
            setState({position:Data.position});
            dispatch(ActionModals.showModal(EnumModals.COMMIT_CONTEXT));
        }

        GraphUtils.openContextModal = modalOpenEventListener;                
        UiUtils.openCommitContextModal = modalOpenEventListener;        

        document.addEventListener("click",(e)=>{
            if(refData.current.show && !refData.current.onHover){
                hideModal();
            }
        });        

    },[])

    const referredLocalBranches = useMemo(()=>{
        if(!store.show || !Data.selectedCommit?.refValues.length)
            return [];        
        const branchList = RepoUtils.repositoryDetails.branchList;
        const referredBranches = Data.selectedCommit.refValues.filter(_=> branchList.includes(_));
        return referredBranches;
    },[store.show,Data.selectedCommit])   

    const branchNamesForDelete = useMemo(()=>{
        if(!store.show || !Data.selectedCommit?.refValues.length)
            return [];
        const branches = referredLocalBranches.slice();        
        return branches;
    },[referredLocalBranches,store.show,Data.selectedCommit])            

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
    

    return (
        <Modal dialogClassName="commitContext" className="context-modal" backdrop={false}  size="sm" backdropClassName="bg-transparent" animation={false} show={store.show} onHide={()=> hideModal()}>
            <Modal.Body onMouseEnter={()=> {refData.current.onHover = true}} onMouseLeave={()=>{refData.current.onHover = false}}>
                <div className="container" onMouseLeave={() => setState({mouseOver:undefined})}>
                    {!!Data.selectedCommit && !Data.selectedCommit.inMergingState && <CommitOptions hideModal={()=>hideModal()} mouseOver={state.mouseOver} onMouseHover={(op) => setState({mouseOver:op})}
                        referredLocalBranches={referredLocalBranches} moreOptionList={moreOptionList} onShowMore={()=> setState({showMore:true})} 
                        showMore={state.showMore} />}
                    {
                        !!Data.selectedCommit?.inMergingState && <MeregingCommitOptions />
                    }
                    
                </div>
            </Modal.Body>
        </Modal>
    )
}

export const CommitContextModal = React.memo(CommitContextModalComponent);