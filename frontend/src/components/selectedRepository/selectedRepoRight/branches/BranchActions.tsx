import React from "react"
import { FaHome, FaMinus, FaPlus, FaSyncAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { BranchGraphUtils } from "../../../../lib/utils/BranchGraphUtils";
import { ActionUI } from "../../../../store/slices/UiSlice";
import { BranchUtils } from "../../../../lib";

function BranchActionsComponent(){
    const dispatch = useDispatch();
    
    const handleRefresh = ()=>{
        dispatch(ActionUI.setLoader({text:"Refreshing..."}));
        dispatch(ActionUI.increamentVersion("branchPanelRefresh"));
    }

    return <div className="d-flex py-2 align-items-center" style={{height:30}}>
    <div className="px-2">
        <FaSyncAlt className="hover" onClick={handleRefresh} />
    </div>
    <div className="d-flex align-items-center justify-content-center border px-2">
        <FaMinus className="px-1 hover border rounded-circle" onClick={()=> BranchGraphUtils.controlZoom("zoomOut",undefined)} />
        <span className="px-1" />
        <FaPlus className="px-1 hover border rounded-circle" onClick={()=>BranchGraphUtils.controlZoom("zoomIn",undefined)} />
        <span className="hover px-1 noselect" onClick={()=> BranchGraphUtils.controlZoom("reset",undefined)}  >Reset</span>
    </div>

    <div className="px-1">
        <FaHome className="cur-point hover" onClick={_=> BranchGraphUtils.state.selectedCommit.setHeadCommit()} />

    </div>

</div>
}

export const BranchActions = React.memo(BranchActionsComponent);