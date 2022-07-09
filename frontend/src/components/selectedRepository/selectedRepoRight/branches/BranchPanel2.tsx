import { IRepositoryDetails } from "common_library";
import  { Fragment } from "react"
import { IViewBox } from "../../../../lib";
import { BranchGraphUtils } from "../../../../lib/utils/BranchGraphUtils";
import { SingleBranch2 } from "./SingleBranch2";

interface IBranchPanelProps{
    // onCommitSelect:(commit:ICommitInfo)=>void;
    // selectedCommit?:ICommitInfo;
    panelHeight:number;
    containerWidth:number;
    viewBox:IViewBox;
    repoDetails:IRepositoryDetails;
    horizontalScrollWidth:number;
    verticalScrollHeight:number;
    
}

export function BranchPanel2(props:IBranchPanelProps){
    // const panelHeight = 400;
    const horizontalScrollContainerWidth = props.containerWidth+10;
    
    // if(!props.repoDetails) return <span className="d-flex justify-content-center w-100">Loading...</span>;

    // const verticalScrollHeight = BranchGraphUtils.getVerticalScrollHeight();
    
    // const horizontalScrollWidth = BranchGraphUtils.getHorizontalScrollWidth();
    console.log("props",props);
    
    return <div id="branchPanel" className="w-100" style={{overflow:'hidden'}}>
        <Fragment>
            <div className="d-flex align-items-stretch" style={{width:`${horizontalScrollContainerWidth}px`}}>
                <svg
                width={props.containerWidth} height={props.panelHeight} viewBox={`${props.viewBox.x} ${props.viewBox.y} ${props.viewBox.width} ${props.viewBox.height}` } style={{transform:`scale(1)`} }>
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
                    <div className="bg-danger position-absolute w-100" style={{height:`${props.verticalScrollHeight}px`,top:0,left:0}}> </div>
                </div>
            </div>            
            <div className="d-flex bg-secondary py-2 position-relative" style={{width:`${horizontalScrollContainerWidth}px`}}>
                <div className="position-absolute bg-danger h-100" style={{width:`${props.horizontalScrollWidth}px`, left:BranchGraphUtils.state.horizontalScrollLeft,top:0}}></div>
            </div>           
        </Fragment>
    </div>
}

// export const BranchPanel2 = React.memo(BranchPanelComponent);