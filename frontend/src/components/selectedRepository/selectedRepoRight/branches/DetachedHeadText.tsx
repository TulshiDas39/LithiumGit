import { Constants, ICommitInfo } from "common_library";
import { RepoUtils } from "../../../../lib";

export function DetachedHeadText(commit:ICommitInfo){
    if(!commit.refValues.length) return null;    
    let y = commit.ownerBranch.y - RepoUtils.commitRadius - 4;
    const x = commit.x + RepoUtils.commitRadius;
    for(let i=0;i<commit.refValues.length-1;i++){                
        y = y - RepoUtils.branchPanelFontSize - 1;
    }
    return <text x={x} y={y} direction="rtl" fontSize={RepoUtils.branchPanelFontSize} fill="blue">{Constants.detachedHeadIdentifier}</text>;
}