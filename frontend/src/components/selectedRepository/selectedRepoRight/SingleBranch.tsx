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
    const getRefs = (commit:ICommitInfo)=>{
        if(!commit.refs) return;
        let refs = commit.refs;
        if(refs.startsWith(BranchUtils.headPrefix)) refs = refs.substr(BranchUtils.headPrefix.length);
        const splits = refs.split(",");

        const refElements:JSX.Element[] = [];
        let y = props.branchDetails.y - BranchUtils.commitRadius - 4;
        for(let sp of splits){
            const x = commit.x + BranchUtils.commitRadius ;//- sp.length * BranchUtils.branchPanelFontSize;
            const elem = <text key={sp} x={x} y={y} direction="rtl" fontSize={BranchUtils.branchPanelFontSize} fill="blue">{sp}</text>;
            refElements.push(elem);
            y = y - BranchUtils.branchPanelFontSize - 1;
        }

        // return <text x="0" y="50" font-family="Verdana" font-size="35" fill="blue">Hello</text>
        return refElements;
    }

    return <> 
    <path d={`M${data.startX},${data.startY} ${data.vLinePath} h${data.hLineLength}`} fill="none" stroke="black" strokeWidth="2"/>
        {
            props.branchDetails.commits.map(c=>(
                <>
                {!!c.refs && getRefs(c)}
                    <circle key={c.hash} cx={c.x} cy={props.branchDetails.y} r={BranchUtils.commitRadius} stroke="black" 
                        strokeWidth="3" fill={`${props.selectedCommit?.hash === c.hash?"green":"red"}`} onClick={()=>props.onCommitSelect(c)} />
                </>
            ))
        }
                    {/* <circle cx="130" cy="250" r="13" stroke="black" stroke-width="3" fill="red" />
                    <circle cx="180" cy="250" r="13" stroke="black" stroke-width="3" fill="red" /> */}
    </>
}

export const SingleBranch = React.memo(SingleBranchComponent);