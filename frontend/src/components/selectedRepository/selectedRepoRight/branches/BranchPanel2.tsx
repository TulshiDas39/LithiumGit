import { IRepositoryDetails } from "common_library";
import  { Fragment } from "react"
import { BranchGraphUtils } from "../../../../lib/utils/BranchGraphUtils";
import { SingleBranch2 } from "./SingleBranch2";
import { EnumHtmlIds } from "../../../../lib";

interface IBranchPanelProps{
    panelHeight:number;
    containerWidth:number;
    repoDetails:IRepositoryDetails;
    scrollBarSize:number;
}

export function BranchPanel2(props:IBranchPanelProps){    
    const horizontalScrollContainerWidth = props.containerWidth+props.scrollBarSize;        
    console.log("horizontalScrollContainerWidth", horizontalScrollContainerWidth)
    console.log("props.panelHeight", props.containerWidth)
    
    return <div id={EnumHtmlIds.branchPanel} className="w-100 d-none" style={{overflow:'hidden'}}>
        <Fragment>
            <div id={BranchGraphUtils.svgContainerId} className="d-flex align-items-stretch" style={{width:`${horizontalScrollContainerWidth-10}px`}}>
                <svg
                width={props.containerWidth} height={props.panelHeight} viewBox={`0 0 ${props.containerWidth} ${props.panelHeight}` } style={{transform:`scale(1)`} }>
                        <g>
                            {
                                props.repoDetails.mergedLines.map(line=>(
                                    <line key={`${line.srcX}-${line.srcY}-${line.endX}-${line.endY}`} x1={line.srcX} y1={line.srcY} x2={line.endX} y2={line.endY} stroke="green" strokeWidth={1} />
                                ))
                            }
                            {
                                props.repoDetails.resolvedBranches.map(branch=>(
                                    <SingleBranch2 key={branch._id} 
                                        branchDetails ={branch}                                         
                                        selectedCommit={props.repoDetails.headCommit} 
                                        scrollLeft={props.repoDetails.branchPanelWidth}
                                        scrollTop={0} 
                                        panelWidth={props.containerWidth}
                                        
                                    />
                                ))
                            }                                        
                        </g>
                </svg>
                <div className="d-flex bg-secondary position-relative" style={{width:`10px`}}>
                    <div id={BranchGraphUtils.verticalScrollBarId} className="bg-danger position-absolute w-100" style={{height:`0px`,top:0,left:0}}> </div>
                </div>
            </div>            
            <div className="d-flex bg-secondary py-2 position-relative" style={{width:`${horizontalScrollContainerWidth}px`}}>
                <div id={BranchGraphUtils.horizontalScrollBarId} className="position-absolute bg-danger h-100" style={{width:`0px`, left:0,top:0}}></div>
            </div>           
        </Fragment>        
    </div>
}

// export const BranchPanel2 = React.memo(BranchPanelComponent);