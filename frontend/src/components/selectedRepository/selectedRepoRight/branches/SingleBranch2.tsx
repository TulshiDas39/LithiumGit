import { IBranchDetails, ICommitInfo } from "common_library";
import { Fragment, useMemo } from "react";
import { BranchUtils, EnumIdPrefix } from "../../../../lib";
import { BranchGraphUtils } from "../../../../lib/utils/BranchGraphUtils";

interface ISingleBranchProps{
    branchDetails:IBranchDetails;
    // onCommitSelect:(commit:ICommitInfo)=>void;
    selectedCommit?:ICommitInfo;
    scrollTop:number;
    scrollLeft:number;
    panelWidth:number;
}

 export function SingleBranch2(props:ISingleBranchProps){
    const data = useMemo(()=>{
        const parentCommit = props.branchDetails.parentCommit;
        const startX = parentCommit?.x || 20;
        const startY = parentCommit?.ownerBranch.y || props.branchDetails.y;
        const endX = props.branchDetails.commits[props.branchDetails.commits.length - 1].x;
        const hLineLength = endX - startX;
        let vLineHeight =  0;
        let archRadius = BranchUtils.branchPanelFontSize;
        if(parentCommit?.ownerBranch.y) vLineHeight = props.branchDetails.y - parentCommit.ownerBranch.y - archRadius;
        let vLinePath = "";
        if(!!vLineHeight) vLinePath = `v${vLineHeight} a${archRadius},${archRadius} 0 0 0 ${archRadius},${archRadius}`
        return {startX,startY,endX,hLineLength,vLinePath}

    },[props.branchDetails]);
    const canShowBranchName=()=>{
        const endX = props.branchDetails.commits[props.branchDetails.commits.length-1].x;
        const startX = props.branchDetails.commits[0].x;
        if(props.scrollLeft < startX || props.scrollLeft > endX || ( props.scrollLeft < endX && endX < props.scrollLeft+props.panelWidth))
            return false;
        return true;
    }
    const getRefs = (commit:ICommitInfo)=>{
        if(!commit.refs) return;
        let refs = commit.refs;
        if(refs.startsWith(BranchUtils.headPrefix)) refs = refs.substring(BranchUtils.headPrefix.length);
        const splits = refs.split(",");

        const refElements:JSX.Element[] = [];
        let y = props.branchDetails.y - BranchUtils.commitRadius - 4;
        for(let sp of splits){
            const x = commit.x + BranchUtils.commitRadius ;
            const elem = <text key={sp} x={x} y={y} direction="rtl" fontSize={BranchUtils.branchPanelFontSize} fill="blue">{sp}</text>;
            refElements.push(elem);
            y = y - BranchUtils.branchPanelFontSize - 1;
        }

        return refElements;
    }

    return <> 
    <path d={`M${data.startX},${data.startY} ${data.vLinePath} h${data.hLineLength}`} fill="none" stroke="black" strokeWidth="3"
         >
         <title>{props.branchDetails.name}</title>
    </path>
        {
            props.branchDetails.commits.map(c=>(
                <Fragment key={c.hash}>
                {!!c.refs && getRefs(c)}
                    <circle id={`${EnumIdPrefix.COMMIT_CIRCLE}${c.hash}`} className="commit" cx={c.x} cy={props.branchDetails.y} r={BranchUtils.commitRadius} stroke="black" 
                        strokeWidth="3" fill={`${props.selectedCommit?.hash === c.hash?BranchGraphUtils.selectedCommitColor:BranchGraphUtils.commitColor}`}/>                     
                    <text id={`${EnumIdPrefix.COMMIT_TEXT}${c.hash}`} className={`commit_text cur-default d-none`} x={c.x} y={props.branchDetails.y} textAnchor="middle" alignmentBaseline="middle" fontSize={BranchUtils.branchPanelFontSize} fill="green" fontWeight="bold">H</text>
                </Fragment>
            ))
        }
        {canShowBranchName() && 
            <text x={props.scrollLeft+10} y = {props.branchDetails.y - BranchUtils.commitRadius - 10} alignmentBaseline="middle">{props.branchDetails.name}</text>
        }                    
    </>
}

// export const SingleBranch2 = React.memo(SingleBranchComponent);