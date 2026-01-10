import { FaCodeBranch } from "react-icons/fa";
import { ContextData, IBaseProps } from "./ContextData";
import { ModalData } from "../ModalData";
import { EnumModals } from "../../../lib";
import { ActionModals } from "../../../store";
import { useDispatch } from "react-redux";
import React from "react";

interface IProps extends IBaseProps{

}

function CreateBranchComponent(props:IProps){
    const dispatch = useDispatch();
    const Data = ModalData.commitContextModal;

    const handleCreateNewBranchClick=()=>{
        ModalData.createBranchModal.sourceCommit = Data.selectedCommit;
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        dispatch(ActionModals.showModal(EnumModals.CREATE_BRANCH));
    }

    return <div className={`row g-0 ${ContextData.optionClasses}`} onMouseEnter={()=> props.onMouseHover(null!)}>
    <div className="col-12 hover cur-default " onClick={handleCreateNewBranchClick}>
        Create branch from this commit <FaCodeBranch />
    </div>
</div>
}

export const CreateBranch = React.memo(CreateBranchComponent);