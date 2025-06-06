import React, { Fragment } from "react";
import { ModalData } from "../ModalData";
import { ContextData, IBaseProps } from "./ContextData";
import { useDispatch } from "react-redux";
import { EnumChangeGroup } from "common_library";
import { FaRegPaperPlane, FaRev, FaUndo } from "react-icons/fa";
import { EnumModals, EnumSelectedRepoTab } from "../../../lib";
import { GitUtils } from "../../../lib/utils/GitUtils";
import { IpcUtils } from "../../../lib/utils/IpcUtils";
import { ActionModals, ActionChanges } from "../../../store";
import { ActionUI } from "../../../store/slices/UiSlice";

interface IProps extends IBaseProps{

}

function RevertCommitComponent(props:IProps){
    const Data = ModalData.commitContextModal;
    const dispatch = useDispatch();
    const revertCommit=()=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));        
        const options = ["revert","HEAD"];
        if(Data.selectedCommit.parentHashes.length > 1){
            options.push("-m", "1");
        }
        IpcUtils.getRaw(options).then(r=>{
            GitUtils.getStatus();
        }).catch(e=>{
            const message = e?.toString() || "Failed to perform cherry-pick.";
            ModalData.errorModal.message = message;
            dispatch(ActionModals.showModal(EnumModals.ERROR));
        });
    }

    if(!Data.selectedCommit?.isHead || !!Data.selectedCommit?.nextCommit)
        return null;

    return <div className={`row g-0 ${ContextData.optionClasses}`} onMouseEnter={()=> props.onMouseHover(null!)}>
                <div className="col-12 hover cur-default " onClick={()=>revertCommit()}>
                    Revert this commit <FaUndo/>
                </div>
           </div>    
}

export const RevertCommit = React.memo(RevertCommitComponent);