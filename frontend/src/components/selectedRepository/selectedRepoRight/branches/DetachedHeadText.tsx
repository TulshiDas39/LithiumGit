import { ICommitInfo } from "common_library";
import { BranchUtils } from "../../../../lib";

export function DetachedHeadText(commit:ICommitInfo){
    if(!commit.refValues.length) return null;    
    let y = commit.ownerBranch.y - BranchUtils.commitRadius - 4;
    const x = commit.x + BranchUtils.commitRadius;
    for(let i=0;i<commit.refValues.length-1;i++){                
        y = y - BranchUtils.branchPanelFontSize - 1;
    }
    return <text x={x} y={y} direction="rtl" fontSize={BranchUtils.branchPanelFontSize} fill="blue">{BranchUtils.detachedHeadIdentifier}</text>;
}