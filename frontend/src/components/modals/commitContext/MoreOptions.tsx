import React, { Fragment, useMemo } from "react";
import { ContextData, IBaseProps, Option } from "./ContextData";
import { IpcUtils } from "../../../lib/utils/IpcUtils";
import { GitUtils } from "../../../lib/utils/GitUtils";
import { ModalData } from "../ModalData";
import { useSelectorTyped } from "../../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { EnumModals, GraphUtils } from "../../../lib";
import { ActionModals } from "../../../store";
import { ActionUI } from "../../../store/slices/UiSlice";
interface IProps extends IBaseProps{
    showMore:boolean;
    moreOptionList:Option[];
    referredLocalBranches:string[];
    mouseOver?:Option;
}
function MoreOptionsComponent(props:IProps){
    const store = useSelectorTyped((state)=>({
        show:state.modal.openedModals.includes(EnumModals.COMMIT_CONTEXT),
    }),shallowEqual);

    const Data = ModalData.commitContextModal;
    const dispatch = useDispatch();
    const softReset=()=>{
        props.hideModal();
        const options:string[]=["--soft","HEAD~1"];
        IpcUtils.reset(options).then(r=>{
            GitUtils.getStatus();
        })
    }

    const hardReset=()=>{
        props.hideModal();
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

    const branchNamesForDelete = useMemo(()=>{
        if(!store.show || !Data.selectedCommit?.refValues.length)
            return [];
        const branches = props.referredLocalBranches.slice();        
        return branches;
    },[props.referredLocalBranches,store.show,Data.selectedCommit])

    const deleteBranch=(branchName:string)=>{
        props.hideModal();
        const handler = ()=>{
            IpcUtils.getRaw(["branch","-D",branchName]).then(r=>{
                if(r.result){
                    GraphUtils.state.filter.resetFilter();
                }
            })
        }
        ModalData.confirmationModal.YesHandler = handler;
        ModalData.confirmationModal.message = `Delete local branch '${branchName}'?`;
        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));        
    }

    return <Fragment>
                {props.moreOptionList.includes(Option.SoftReset) && <div className={`row g-0 ${ContextData.optionClasses}`} onMouseEnter={()=> props.onMouseHover(null!)}>
                    <div className="col-12 hover cur-default " onClick={softReset}>Soft reset this commit</div>
                </div>}
                {props.moreOptionList.includes(Option.HardReset) && <div className={`row g-0 ${ContextData.optionClasses}`} onMouseEnter={()=> props.onMouseHover(null!)}>
                    <div className="col-12 hover cur-default " onClick={hardReset}>Hard reset this commit</div>
                </div>}                        
                {
                props.moreOptionList.includes(Option.DeleteBranch) && 
                <div className={`row g-0 ${ContextData.optionClasses}`}>
                    {
                        branchNamesForDelete.length > 1 ? <div className="col-12 cur-default position-relative">
                            <div className="d-flex hover" onMouseEnter={()=> props.onMouseHover(Option.DeleteBranch)}>
                                <span className="flex-grow-1 text-danger">Delete branch</span>
                                <span>&gt;</span>
                            </div>
                            
                            {(props.mouseOver === Option.DeleteBranch) && <div className="position-absolute border bg-white" style={{left:'100%',top:0}}>
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

export const MoreOptions = React.memo(MoreOptionsComponent);