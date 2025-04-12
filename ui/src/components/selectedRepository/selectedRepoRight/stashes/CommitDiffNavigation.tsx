import { IFile, StringUtils } from "common_library";
import React, { Fragment } from "react";
import { FaArrowsAltH } from "react-icons/fa";
import { StepNavigation } from "../../../common";

interface IProps{
    currentStep:number;
    totalStep:number;
    handleNext:()=>void;
    handlePrevious:()=>void;
    file:IFile;
    stashHash:string;
}

function CommitDiffNavigationComponent(props:IProps){   
    return <div className="d-flex">
            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <Fragment>
                    <span className="pe-1 overflow-ellipsis" title={props.file.path} style={{maxWidth:300}}>{StringUtils.getFileName(props.file.path)} </span>
                    <span>({props.stashHash})</span>                    
                </Fragment>
            </div>
            <div className="pe-4">
                <StepNavigation currentStep={props.currentStep} totalStep={props.totalStep} 
                    onNextClick={props.handleNext} onPreviousClick={props.handlePrevious} />
            </div>
            
        </div>
}

export const CommitDiffNavigation = React.memo(CommitDiffNavigationComponent);