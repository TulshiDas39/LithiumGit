import { IBranchDetails } from "common_library";
import React, { useMemo } from "react";

interface ISingleBranchProps{
    branchDetails:IBranchDetails;
}

function SingleBranchComponent(props:ISingleBranchProps){
    const x = useMemo(()=>{
        const parentCommit = props.branchDetails.parentCommit;
        return parentCommit?.x || 20;
    },[props.branchDetails.parentCommit])
    return <> 
    <path d={`M${x},${props.branchDetails.y} v130 a20,20 0 0 0 20,20 h200`} fill="none" stroke="black" stroke-width="2"/>
                    <circle cx="130" cy="250" r="13" stroke="black" stroke-width="3" fill="red" />
                    <circle cx="180" cy="250" r="13" stroke="black" stroke-width="3" fill="red" />
    </>
}

export const SingleBranch = React.memo(SingleBranchComponent);