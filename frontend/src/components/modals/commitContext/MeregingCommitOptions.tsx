import React, { Fragment } from "react"
import { ModalData } from "../ModalData";
import { ContextData } from "./ContextData";
import { useDispatch } from "react-redux";
import { ActionModals } from "../../../store";
import { EnumModals } from "../../../lib";
import { GitUtils } from "../../../lib/utils/GitUtils";

interface IProps{

}

function MeregingCommitOptionsComponent(){
    const Data = ModalData.commitContextModal;
    const dispatch = useDispatch();
    const abortMerge = ()=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        GitUtils.abortMerge();
    }

    if(!Data.selectedCommit.inMergingState)
        return null;

    return <Fragment>
            <div className={`row g-0 ${ContextData.optionClasses}`} >
                <div className="col-12 hover cur-default " onClick={()=>abortMerge()}>Abort merge</div>
            </div>
    </Fragment>
}

export const MeregingCommitOptions = React.memo(MeregingCommitOptionsComponent);