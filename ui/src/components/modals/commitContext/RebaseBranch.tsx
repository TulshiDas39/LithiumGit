import React, { Fragment } from "react";
import { ModalData } from "../ModalData";
import { ContextData, IBaseProps, Option } from "./ContextData";
import { EnumModals, EnumSelectedRepoTab } from "../../../lib";
import { useDispatch } from "react-redux";
import { IpcUtils } from "../../../lib/utils/IpcUtils";
import { ActionModals } from "../../../store";
import { GitUtils } from "../../../lib/utils/GitUtils";
import { ActionUI } from "../../../store/slices/UiSlice";

interface IProps extends IBaseProps{
    referredLocalBranches:string[];
    mouseOver?:Option;
}

function RebaseBranchComponent(props:IProps){
    const Data = ModalData.commitContextModal;
    const dispatch = useDispatch();

    const rebaseBranch=(branch:string)=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        IpcUtils.rebaseBranch(branch).then(_=>{
            GitUtils.getStatus();
        }).catch(e=>{
            GitUtils.getStatus().then(r=>{
                if(r.rebasingCommit){
                    dispatch(ActionUI.setSelectedRepoTab(EnumSelectedRepoTab.CHANGES));
                }
            });
            ModalData.errorModal.message = e?.toString() || "Failed to rebase.";
            dispatch(ActionModals.showModal(EnumModals.ERROR));
        })        
    }

    return <Fragment>
                {
                !Data.selectedCommit?.isHead && props.referredLocalBranches.length > 0 &&
                    <div className={`row g-0 ${ContextData.optionClasses}`}>
                        {
                            props.referredLocalBranches.length > 1 ? <div className="col-12 cur-default position-relative">
                                <div className="d-flex hover" onMouseEnter={()=> props.onMouseHover(Option.Rebase)}>
                                    <span className="flex-grow-1">Rebase branch</span>
                                    <span>&gt;</span>
                                </div>
                                
                                {(props.mouseOver === Option.Rebase) && <div className="position-absolute border bg-white" style={{left:'100%',top:0}}>
                                    {
                                        props.referredLocalBranches.map((br=>(
                                            <div key={br} className="border-bottom py-1 px-3">
                                                <span className="hover" onClick={() => rebaseBranch(br)}>{br}</span>
                                            </div>
                                        )))
                                    }
                                </div>}
                            </div>:
                            <div className="col-12 hover cur-default " onClick={() => rebaseBranch(props.referredLocalBranches[0])}>Rebase branch '{props.referredLocalBranches[0]}'</div>
                        }                                
                    </div>                        
                }
    </Fragment>
}

export const RebaseBranch = React.memo(RebaseBranchComponent);