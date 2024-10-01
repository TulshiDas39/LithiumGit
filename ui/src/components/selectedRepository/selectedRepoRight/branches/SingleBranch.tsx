import { Constants, IBranchDetails, ICommitInfo } from "common_library";
import { Fragment } from "react";
import { RepoUtils, EnumIdPrefix } from "../../../../lib";
import { GraphUtils } from "../../../../lib/utils/GraphUtils";

interface ISingleBranchProps{
    branchDetails:IBranchDetails;
    // onCommitSelect:(commit:ICommitInfo)=>void;
    selectedCommit?:ICommitInfo;
    scrollTop:number;
    scrollLeft:number;
    panelWidth:number;
}

 export function SingleBranch(props:ISingleBranchProps){
    const data = GraphUtils.getBranchLinePathData(props.branchDetails);

    const linePath = GraphUtils.getBranchLinePath(data.startX,data.startY,data.vLinePath,data.hLineLength);

    const canShowBranchName=()=>{
        const endX = props.branchDetails.commits[props.branchDetails.commits.length-1].x;
        const startX = props.branchDetails.commits[0].x;
        if(props.scrollLeft < startX || props.scrollLeft > endX || ( props.scrollLeft < endX && endX < props.scrollLeft+props.panelWidth))
            return false;
        return true;
    }
    const getRefs = (commit:ICommitInfo)=>{
        if(!commit.refValues.length) return;
        const refElements:JSX.Element[] = [];
        let y = props.branchDetails.y - RepoUtils.commitRadius - 4;
        for(let sp of commit.refValues){
            const x = commit.x + RepoUtils.commitRadius ;
            const elem = <text className={`refText ${EnumIdPrefix.COMMIT_REF}${commit.hash} ${sp === Constants.detachedHeadIdentifier?'headRef':''}`} key={sp} x={x} y={y} direction="rtl" fontSize={RepoUtils.branchPanelFontSize} fill="blue">{sp}</text>;
            refElements.push(elem);
            y = y - RepoUtils.branchPanelFontSize - 1;
        }

        return refElements;
    }

    return <> 
    <path id={`${EnumIdPrefix.BRANCH_LINE}${props.branchDetails._id}`} d={linePath} fill="none" stroke="black" strokeWidth="3"
         >
         <title>{props.branchDetails.name}</title>
    </path>
        {
            props.branchDetails.commits.map(c=>(
                <Fragment key={c.hash}>
                {!!c.refs && getRefs(c)}
                    <circle id={`${EnumIdPrefix.COMMIT_CIRCLE}${c.hash}`} className="commit" cx={c.x} cy={props.branchDetails.y} r={RepoUtils.commitRadius} stroke="black" 
                        strokeWidth="3" fill={`${props.selectedCommit?.hash === c.hash?GraphUtils.selectedCommitColor:GraphUtils.commitColor}`}/>                     
                    <text id={`${EnumIdPrefix.COMMIT_TEXT}${c.hash}`} className={`commit_text cur-default d-none`} x={c.x} y={props.branchDetails.y} textAnchor="middle" alignmentBaseline="middle" fontSize={RepoUtils.branchPanelFontSize} fill="green" fontWeight="bold">H</text>
                </Fragment>
            ))
        }
        {canShowBranchName() && 
            <text x={props.scrollLeft+10} y = {props.branchDetails.y - RepoUtils.commitRadius - 10} alignmentBaseline="middle">{props.branchDetails.name}</text>
        }                    
    </>
}

// export const SingleBranch2 = React.memo(SingleBranchComponent);