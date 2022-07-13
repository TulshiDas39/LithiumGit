import React from "react"
import { FaHome, FaMinus, FaPlus, FaSyncAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { BranchGraphUtils } from "../../../../lib/utils/BranchGraphUtils";
import { ActionUI } from "../../../../store/slices/UiSlice";

function BranchActionsComponent(){
    const dispatch = useDispatch();
    
    const handleRefresh = ()=>{
        BranchGraphUtils.showBrnchPanelLoader();
        dispatch(ActionUI.increamentVersion("branchPanelRefresh"));
    }

    return <div className="d-flex py-2 align-items-center">
    <div className="px-2">
        <FaSyncAlt className="hover" onClick={handleRefresh} />
    </div>
    <div className="d-flex align-items-center justify-content-center border px-2">
        <FaMinus className="px-1 hover border rounded-circle" onClick={()=> BranchGraphUtils.controlZoom("zoomOut")} />
        <span className="px-1" />
        <FaPlus className="px-1 hover border rounded-circle" onClick={()=>BranchGraphUtils.controlZoom("zoomIn")} />
        <span className="hover px-1 noselect" onClick={()=> BranchGraphUtils.controlZoom("reset")}  >Reset</span>
    </div>

    <div className="px-1">
        <FaHome className="cur-point hover" onClick={_=> BranchGraphUtils.scrollToHeadCommit()} />

    </div>

</div>
}

export const BranchActions = React.memo(BranchActionsComponent);