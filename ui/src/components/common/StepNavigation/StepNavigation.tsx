import React from "react"
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

interface IProps{
    currentStep:number;
    totalStep:number;
    onNextClick:()=>void;
    onPreviousClick:()=>void;
}
function StepNavigationComponent(props:IProps){
    return <div style={{height:30}} className="d-flex align-items-center justify-content-center">
    <span>Showing {props.currentStep} of {props.totalStep}</span>
    <span className="px-1 d-flex align-items-center">
        <FaArrowUp title="Previous" className="hover" onClick={props.onPreviousClick} />
    </span>
    <span className="ps-1 d-flex align-items-center">
        <FaArrowDown title="Next" className="hover" onClick={props.onNextClick} />
    </span>
</div>
}

export const StepNavigation = React.memo(StepNavigationComponent);