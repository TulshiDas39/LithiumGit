import { IBranchDetails, ICommitInfo } from "common_library";
import React, { useMemo } from "react";
import { BranchUtils } from "../../../lib";

interface ISingleBranchProps{
    branchDetails:IBranchDetails;
    onCommitSelect:(commit:ICommitInfo)=>void;
    selectedCommit?:ICommitInfo;
}

function SingleBranchComponent(props:ISingleBranchProps){
    const data = useMemo(()=>{
        const parentCommit = props.branchDetails.parentCommit;
        const startX = parentCommit?.x || 20;
        const endX = props.branchDetails.commits[props.branchDetails.commits.length - 1].x;
        const hLineLength = endX - startX;
        let vLineHeight =  0;
        let archRadius = BranchUtils.branchPanelFontSize;
        if(parentCommit?.ownerBranch.y) vLineHeight = props.branchDetails.y - parentCommit.ownerBranch.y - archRadius;
        let vLinePath = "";
        if(!!vLineHeight) vLinePath = `v${vLineHeight} a${archRadius},${archRadius} 0 0 0 ${archRadius},${archRadius}`
        return {startX,endX,hLineLength,vLinePath}

    },[props.branchDetails]);
    return <> 
    <path d={`M${data.startX},${props.branchDetails.y} ${data.vLinePath} h${data.hLineLength}`} fill="none" stroke="black" strokeWidth="2"/>
        {
            props.branchDetails.commits.map(c=>(
                <circle key={c.hash} cx={c.x} cy={props.branchDetails.y} r={BranchUtils.commitRadius} stroke="black" 
                    strokeWidth="3" fill={`${props.selectedCommit?.hash === c.hash?"green":"red"}`} onClick={()=>props.onCommitSelect(c)} />
            ))
        }
                    {/* <circle cx="130" cy="250" r="13" stroke="black" stroke-width="3" fill="red" />
                    <circle cx="180" cy="250" r="13" stroke="black" stroke-width="3" fill="red" /> */}
    </>
}

export const SingleBranch = React.memo(SingleBranchComponent);