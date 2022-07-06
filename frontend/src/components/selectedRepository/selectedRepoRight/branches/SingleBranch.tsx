import { IBranchDetails, ICommitInfo } from "common_library";
import { dialog } from "electron";
import React, { Fragment, MouseEvent, useMemo } from "react";
import { useDispatch } from "react-redux";
import { BranchUtils, EnumIdPrefix, EnumModals } from "../../../../lib";
import { ActionModals } from "../../../../store";
import { ModalData } from "../../../modals/ModalData";

interface ISingleBranchProps{
    branchDetails:IBranchDetails;
    onCommitSelect:(commit:ICommitInfo)=>void;
    selectedCommit?:ICommitInfo;
    scrollTop:number;
    scrollLeft:number;
    panelWidth:number;
}

function SingleBranchComponent(props:ISingleBranchProps){
    const dispatch = useDispatch();
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

    const handleCommitRightClick=(e:React.MouseEvent<any>, commit:ICommitInfo)=>{
        ModalData.commitContextModal.selectedCommit = commit;
        ModalData.commitContextModal.position = {
            x:e.clientX,
            y:e.clientY,
        };
        dispatch(ActionModals.showModal(EnumModals.COMMIT_CONTEXT));
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
                    <circle id={c.hash} cx={c.x} cy={props.branchDetails.y} r={BranchUtils.commitRadius} stroke="black" 
                        strokeWidth="3" fill={`${props.selectedCommit?.hash === c.hash?"blueviolet":"cadetblue"}`} onClick={()=>props.onCommitSelect(c)} 
                        onContextMenu={(e) => handleCommitRightClick(e,c)}/>                     
                    <text id={`${EnumIdPrefix.COMMIT_TEXT}${c.hash}`} className={`cur-default ${c.isHead?"":"d-none"}`} x={c.x} onContextMenu={(e) => handleCommitRightClick(e,c)} y={props.branchDetails.y} textAnchor="middle" alignmentBaseline="middle" fontSize={BranchUtils.branchPanelFontSize} fill="green" fontWeight="bold">H</text>
                </Fragment>
            ))
        }
        {canShowBranchName() && 
            <text x={props.scrollLeft+10} y = {props.branchDetails.y - BranchUtils.commitRadius - 10} alignmentBaseline="middle">{props.branchDetails.name}</text>
        }                    
    </>
}

export const SingleBranch = React.memo(SingleBranchComponent);