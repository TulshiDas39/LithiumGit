import React, { Fragment, useMemo } from "react"
import { StepNavigation } from "../../../common";
import { EnumChangeType, IFile, StringUtils } from "common_library";
import { GraphUtils } from "../../../../lib";
import { FaArrowsAltH } from "react-icons/fa";

interface IProps{
    currentStep:number;
    totalStep:number;
    handleNext:()=>void;
    handlePrevious:()=>void;
    file:IFile;
}

function CommitDiffNavigationComponent(props:IProps){
    const hash2 = useMemo(()=>{
        if(props.file?.changeType !== EnumChangeType.MODIFIED)
            return "";
        return GraphUtils.state.selectedCommit.value?.parentHashes.join();
    },[GraphUtils.state.selectedCommit.value,props.file]);

    const hash1 = useMemo(()=>{
        if(!props.file)
            return "";
        if(props.file.changeType === EnumChangeType.DELETED)
            return GraphUtils.state.selectedCommit.value?.parentHashes.join();
        return GraphUtils.state.selectedCommit.value?.avrebHash;
    },[GraphUtils.state.selectedCommit.value,props.file]);

    return <div className="d-flex">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
            {!!props.file && <Fragment>
                <span className="pe-1 overflow-ellipsis" title={props.file.path} style={{maxWidth:300}}>{StringUtils.getFileName(props.file.path)} </span>
                <span>({hash1}</span>
                {!!hash2 && 
                   <Fragment>
                        <span className="px-1">
                            <FaArrowsAltH />
                        </span>                        
                        <span>{hash2}</span>
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