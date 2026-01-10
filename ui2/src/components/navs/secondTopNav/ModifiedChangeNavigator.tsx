import { EnumChangeType, IFile } from "common_library";
import React, {  useEffect } from "react"
import { FaArrowsAltH } from "react-icons/fa";
import { StepNavigation } from "../../common";
import { ChangesData } from "../../../lib";

interface IProps{
    selectedFile:IFile;
    totalStep:number;
    currentStep:number;
    stepResetVersion:number;
    onNextClick:()=>void;
    onPreviousClick:()=>void;
}
function ModifiedChangeNavigatorComponent(props:IProps){
    
    useEffect(()=>{
        if(!props.currentStep)
            return;
        ChangesData.changeUtils.FocusHightlightedLine(props.currentStep);
    },[props.currentStep,props.stepResetVersion])
    
    return <div className="w-100 h-100 d-flex align-items-center">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
            <div title={props.selectedFile.path} className="overflow-ellipsis" style={{maxWidth:200}}>
                {props.selectedFile.fileName}
            </div>
            <div className="px-2">(                 
                    {props.selectedFile.changeType === EnumChangeType.DELETED && <span>Index</span>}
                    {props.selectedFile.changeType === EnumChangeType.MODIFIED &&
                        <span className="px-2">Index <FaArrowsAltH/> Working Directory</span>
                    }
                    {props.selectedFile.changeType === EnumChangeType.CREATED &&
                        <span>Working Directory</span>
                    }
             )</div>
        </div>
        
        <div className="ps-2 pe-4">
            <StepNavigation  currentStep={props.currentStep} totalStep={props.totalStep}
                onNextClick={props.onNextClick} onPreviousClick={props.onPreviousClick} />
        </div>
    </div>
}

export const ModifiedChangeNavigator = React.memo(ModifiedChangeNavigatorComponent);