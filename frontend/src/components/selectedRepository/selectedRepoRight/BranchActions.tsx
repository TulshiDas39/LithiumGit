import React from "react"
import { FaSyncAlt } from "react-icons/fa";

function BranchActionsComponent(){
    return <div className="d-flex">
        <FaSyncAlt className="" />
    </div>
}

export const BranchActions = React.memo(BranchActionsComponent);