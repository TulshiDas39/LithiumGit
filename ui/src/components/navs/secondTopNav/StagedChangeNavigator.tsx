import { EnumChangeType, IFile } from "common_library";
import React, { Fragment, useEffect } from "react"
import { FaArrowsAltH } from "react-icons/fa";
import { StepNavigation } from "../../common";
import { ChangeUtils } from "../../../lib/utils/ChangeUtils";
import { ChangesData } from "../../../lib";

interface IProps{
    selectedFile:IFile;
    totalStep:number;
    currentStep:number;
    stepResetVersion:number;
    onNextClick:()=>void;
    onPreviousClick:()=>void;
}

function StagedChangeNavigatorComponent(props:IProps){

    useEffect(()=>{
        if(!props.currentStep)
            return;
        ChangesData.changeUtils.FocusHightlightedLine(props.currentStep);
    },[props.currentStep,props.stepResetVersion])
    
    return <div className="w-100 h-100 d-flex align-items-center">
        <div className="d-flex align-items-center" style={{width:'80%'}}>
            {props.selectedFile.changeType !== EnumChangeType.RENAMED && <div title={props.selectedFile.path} className="overflow-ellipsis" style={{maxWidth:300}}>
                {props.selectedFile.fileName}                
            </div>}
            {props.selectedFile.changeType !== EnumChangeType.RENAMED &&
                <div className="px-2 d-flex align-items-center" style={{maxWidth:300}}>            
                    {
                        props.selectedFile.changeType === EnumChangeType.CREATED
                     && <span>(Index)</span>}
                    {
                        props.selectedFile.changeType === EnumChangeType.DELETED                        
                     && <span>(HEAD)</span>}
                    {props.selectedFile.changeType === EnumChangeType.MODIFIED &&
                        <span className="">(
                           <span className="px-2">HEAD</span>
                           <FaArrowsAltH/>
                           <span className="px-2">Index</span>
                        )</span>
                    }                    
             </div>}
             {props.selectedFile.changeType === EnumChangeType.RENAMED && 
                <div className="d-flex w-100">
                    <div className="text-center overflow-ellipsis" style={{width:`calc(50% - 15px)`}}>
                        {props.selectedFile.oldFileName}(HEAD)
                    </div>
                    <div className="d-flex align-items-center justify-content-center" style={{width:'30px'}}>
                        <FaArrowsAltH />
                    </div>
                    <div title={props.selectedFile.path} className="text-center overflow-ellipsis" style={{width:`calc(50% - 15px)`}}>
                        {props.selectedFile.fileName}(Index)
                    </div>
                </div>
             }
        </div>
        
        <div className="ps-2 pe-4 d-flex justify-content-end" style={{width:'20%'}}>
            <StepNavigation currentStep={props.currentStep} totalStep={props.totalStep}
                onNextClick={props.onNextClick} onPreviousClick={props.onPreviousClick} />
        </div>
    </div>
}

export const StagedChangeNavigator = React.memo(StagedChangeNavigatorComponent);