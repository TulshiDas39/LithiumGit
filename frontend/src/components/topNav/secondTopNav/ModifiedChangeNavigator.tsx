import { EnumChangeType, IFile } from "common_library";
import React, { Fragment, useEffect } from "react"
import { FaArrowsAltH } from "react-icons/fa";
import { StepNavigation } from "../../common";
import { ChangeUtils } from "../../../lib/utils/ChangeUtils";

interface IProps{
    selectedFile:IFile;
    totalStep:number;
    currentStep:number;
    onNextClick:()=>void;
    onPreviousClick:()=>void;
}
function ModifiedChangeNavigatorComponent(props:IProps){
    
    useEffect(()=>{
        if(!props.currentStep)
            return;
        ChangeUtils.FocusHightlightedLine(props.currentStep);
    },[props.currentStep])
    
    return <div className="w-100 h-100 d-flex align-items-center">
        <div className="flex-grow-1 d-flex align-items-center">
            <div title={props.selectedFile.path} className="overflow-ellipsis" style={{maxWidth:200}}>
                {props.selectedFile.fileName}
            </div>
            <div className="px-2">(                 
                    {props.selectedFile.changeType !== EnumChangeType.DELETED && <span>Working Directory</span>}
                    {props.selectedFile.changeType === EnumChangeType.MODIFIED &&
                        <span className="px-2"><FaArrowsAltH/></span>
                    }
                    {props.selectedFile.changeType !== EnumChangeType.CREATED &&
                        <span>Index</span>
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