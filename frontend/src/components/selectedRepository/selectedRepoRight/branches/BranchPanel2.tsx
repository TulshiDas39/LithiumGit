import { IRepositoryDetails } from "common_library";
import  { Fragment } from "react"
import { ScaleLoader } from "react-spinners";
import { LoaderIcon } from "../../../../assets";
import { IViewBox } from "../../../../lib";
import { BranchGraphUtils } from "../../../../lib/utils/BranchGraphUtils";
import { SingleBranch2 } from "./SingleBranch2";

interface IBranchPanelProps{
    panelHeight:number;
    containerWidth:number;
    viewBox:IViewBox;
    repoDetails:IRepositoryDetails;
    horizontalScrollWidth:number;
    verticalScrollHeight:number;
    horizontalScrollLeft:number;
    verticalScrollTop:number;
}

export function BranchPanel2(props:IBranchPanelProps){    
    const horizontalScrollContainerWidth = props.containerWidth+10;        
    
    return <div id="branchPanel" className="w-100 position-relative" style={{overflow:'hidden'}}>
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
                    <div id={BranchGraphUtils.verticalScrollBarId} className="bg-danger position-absolute w-100" style={{height:`${props.verticalScrollHeight}px`,top:props.verticalScrollTop,left:0}}> </div>
                </div>
            </div>            
            <div className="d-flex bg-secondary py-2 position-relative" style={{width:`${horizontalScrollContainerWidth}px`}}>
                <div id={BranchGraphUtils.horizontalScrollBarId} className="position-absolute bg-danger h-100" style={{width:`${props.horizontalScrollWidth}px`, left:props.horizontalScrollLeft,top:0}}></div>
            </div>           
        </Fragment>
        <div id="branchPanelLoader" className="position-absolute w-100 h-100 bg-white text-center d-none" style={{top:0,left:0,opacity:0.8}}>            
            <div className="row g-0 h-100 align-items-center">
                <div className="col-12">                    
                    <ScaleLoader loading={true} color="black" />
                </div>
            </div>
        </div>
    </div>
}

// export const BranchPanel2 = React.memo(BranchPanelComponent);