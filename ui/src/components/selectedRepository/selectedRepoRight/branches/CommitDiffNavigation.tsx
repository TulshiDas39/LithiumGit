import React, { Fragment, useMemo } from "react"
import { StepNavigation } from "../../../common";
import { EnumChangeType, IFile, StringUtils } from "common_library";
import { GraphUtils } from "../../../../lib";
import { FaArrowsAltH } from "react-icons/fa";

{/* <StepNavigation currentStep={state.currentStep} totalStep={state.totalStep} 
            onNextClick={handleNext} onPreviousClick={handlePrevious} /> */}

interface IProps{
    currentStep:number;
    totalStep:number;
    handleNext:()=>void;
    handlePrevious:()=>void;
    file:IFile;
}

function CommitDiffNavigationComponent(props:IProps){
    const parentCommit = useMemo(()=>{
        if(props.file?.changeType !== EnumChangeType.MODIFIED)
            return "";
        return GraphUtils.state.selectedCommit.value?.parentHashes.join();
    },[GraphUtils.state.selectedCommit.value,props.file]);

    const currentCommit = GraphUtils.state.selectedCommit.value?.avrebHash;

    return <div className="d-flex">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
            {!!props.file && <Fragment>
                <span title={props.file.path}>{StringUtils.getFileName(props.file.path)}</span>
                <span>({currentCommit}</span>
                {!!parentCommit && 
                   <Fragment>
                        <span className="px-1">
                            <FaArrowsAltH />
                        </span>                        
                        <span>{parentCommit}</span>
                   </Fragment> 
                }
                <span>)</span>
            </Fragment>}
        </div>
        <div className="pe-4">
            <StepNavigation currentStep={props.currentStep} totalStep={props.totalStep} 
                onNextClick={props.handleNext} onPreviousClick={props.handlePrevious} />
        </div>
        
    </div>
}

export const CommitDiffNavigation = React.memo(CommitDiffNavigationComponent);