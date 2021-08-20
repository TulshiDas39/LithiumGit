import React from "react"
import { FaSyncAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { ActionUI } from "../../../store/slices/UiSlice";

function BranchActionsComponent(){
    const dispatch = useDispatch();
    return <div className="d-flex py-2">
        <FaSyncAlt className="hover" onClick={()=> dispatch(ActionUI.increamentVersion("branchPanelRefresh"))} />
    </div>
}

export const BranchActions = React.memo(BranchActionsComponent);