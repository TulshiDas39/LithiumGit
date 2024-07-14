import { IFile } from "common_library";
import React, { useEffect } from "react";
import { FaArrowsAltH } from "react-icons/fa";
import { AppButton, StepNavigation } from "../../common";
import { ConflictUtils } from "../../../lib";
import { useSelectorTyped } from "../../../store/rootReducer";
import { shallowEqual } from "react-redux";
import { IpcUtils } from "../../../lib/utils/IpcUtils";

interface IProps{
    selectedFile:IFile;
    totalStep:number;
    currentStep:number;
    stepResetVersion:number;
    onNextClick:()=>void;
    onPreviousClick:()=>void;
}

function ConflictChangeNavigatorComponent(props:IProps){
    const store = useSelectorTyped(state=>({
        totalConflict:state.conflict.totalConflict,
        resolvedCount:state.conflict.resolvedConflict,
    }),shallowEqual);
    
    useEffect(()=>{
        if(!props.currentStep)
            return;
        ConflictUtils.FocusHightlightedLine(props.currentStep);
    },[props.currentStep,props.stepResetVersion])

    const handleApply=()=>{
        const actions = ConflictUtils.Actions;
        IpcUtils.resolveConflict(props.selectedFile.path,actions).then((r)=>{
            if(!r.error){
                ConflictUtils.resetData();
                IpcUtils.stageItems([props.selectedFile.path]).then(()=>{
                    IpcUtils.getRepoStatus();
                });
            }
            
        });
    }

    return <div className="w-100 h-100 row g-0">
    <div className="col-5 d-flex align-items-center">
        <div title={props.selectedFile.path} className="overflow-ellipsis" style={{maxWidth:200}}>
            {props.selectedFile.fileName}
        </div>
        <div className="px-2">(                 
                <span>Working Directory</span>
                <span className="px-2"><FaArrowsAltH/></span>                
                <span>Index</span>
         )</div>
    </div>
    <div className="col-2 d-flex justify-content-center">
        {store.resolvedCount !== store.totalConflict &&
            <div title={`${store.totalConflict} total conflict, ${store.resolvedCount} resolved`} className="overflow-ellipsis d-flex align-items-center">
                Resolved {store.resolvedCount}/{store.totalConflict}
            </div>
        }
        {store.resolvedCount === store.totalConflict &&
            <AppButton type="success" style={{color:'white'}} onClick={handleApply}>Apply</AppButton>
        }
    </div>
    
    <div className="ps-2 pe-4 col-5 d-flex justify-content-end">
        <StepNavigation  currentStep={props.currentStep} totalStep={props.totalStep}
            onNextClick={props.onNextClick} onPreviousClick={props.onPreviousClick} />
    </div>
</div>
}

export const ConflictChangeNavigator = React.memo(ConflictChangeNavigatorComponent);