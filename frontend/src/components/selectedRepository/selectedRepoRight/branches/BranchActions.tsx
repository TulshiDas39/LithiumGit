import React from "react"
import { FaHome, FaMinus, FaPlus, FaSyncAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { GraphUtils } from "../../../../lib/utils/GraphUtils";
import { ActionUI } from "../../../../store/slices/UiSlice";
import { RepoUtils } from "../../../../lib";
import { Messages } from "../../../../lib/constants";

function BranchActionsComponent(){
    const dispatch = useDispatch();
    
    const handleRefresh = ()=>{
        //dispatch(ActionUI.setLoader({text:Messages.refreshing}));
        dispatch(ActionUI.increamentVersion("branchPanelRefresh"));
    }

    return <div className="d-flex py-2 align-items-center" style={{height:30}}>
    <div className="px-2">
        <FaSyncAlt className="hover" onClick={handleRefresh} />
    </div>
    <div className="d-flex align-items-center justify-content-center border px-2">
        <FaMinus className="px-1 hover border rounded-circle" onClick={()=> GraphUtils.controlZoom("zoomOut",undefined)} />
        <span className="px-1" />
        <FaPlus className="px-1 hover border rounded-circle" onClick={()=>GraphUtils.controlZoom("zoomIn",undefined)} />
        <span className="hover px-1 noselect" onClick={()=> GraphUtils.controlZoom("reset",undefined)}  >Reset</span>
    </div>

    <div className="px-1">
        <FaHome className="cur-point hover" onClick={_=> GraphUtils.state.selectedCommit.setHeadCommit()} />

    </div>

</div>
}

export const BranchActions = React.memo(BranchActionsComponent);