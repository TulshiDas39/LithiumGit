import React, { Fragment } from "react";
import { ModalData } from "../ModalData";
import { ContextData, IBaseProps } from "./ContextData";
import { useDispatch } from "react-redux";
import { EnumChangeGroup } from "common_library";
import { FaRegPaperPlane } from "react-icons/fa";
import { EnumModals, EnumSelectedRepoTab } from "../../../lib";
import { GitUtils } from "../../../lib/utils/GitUtils";
import { IpcUtils } from "../../../lib/utils/IpcUtils";
import { ActionModals, ActionChanges } from "../../../store";
import { ActionUI } from "../../../store/slices/UiSlice";

interface IProps extends IBaseProps{

}

function CherryPickComponent(props:IProps){
    const Data = ModalData.commitContextModal;
    const dispatch = useDispatch();
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

    if(!!Data.selectedCommit?.isHead)
        return null;

    return <div className={`row g-0 ${ContextData.optionClasses}`} onMouseEnter={()=> props.onMouseHover(null!)}>
                <div className="col-12 hover cur-default " onClick={()=>cherryPick()}>
                    Cherry-Pick this commit <FaRegPaperPlane />
                </div>
           </div>    
}

export const CherryPick = React.memo(CherryPickComponent);