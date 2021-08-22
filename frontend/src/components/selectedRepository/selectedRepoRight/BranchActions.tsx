import React from "react"
import { FaMinus, FaPlus, FaSyncAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { ActionUI } from "../../../store/slices/UiSlice";

function BranchActionsComponent(){
    const dispatch = useDispatch();
    return <div className="d-flex py-2 align-items-center">
    <div className="px-2">
        <FaSyncAlt className="hover" onClick={()=> dispatch(ActionUI.increamentVersion("branchPanelRefresh"))} />
    </div>
    <div className="d-flex align-items-center justify-content-center border px-2">
        <FaMinus className="px-1 hover" onClick={()=>dispatch(ActionUI.decreamentBranchPanelZoom())} />
        <FaPlus className="px-1 hover" onClick={()=>dispatch(ActionUI.increamentBranchPanelZoom())} />
        <span className="hover px-1" onClick={()=>dispatch(ActionUI.resetBranchPanelZoom())}  >Reset</span>
    </div>
</div>
}

export const BranchActions = React.memo(BranchActionsComponent);