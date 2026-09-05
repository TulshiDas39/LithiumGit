import { IFile } from "common_library";
import React, { useEffect } from "react";
import { FaArrowsAltH, FaEllipsisV } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import { AppButton, StepNavigation } from "../../common";
import { ChangesData, EnumModals } from "../../../lib";
import { useSelectorTyped } from "../../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { ActionChanges, ActionModals } from "../../../store";
import { ModalData } from "../../modals/ModalData";
import { IpcUtils } from "../../../lib/utils/IpcUtils";
import { GitUtils } from "../../../lib/utils/GitUtils";

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

    const dispatch = useDispatch();
    
    useEffect(()=>{
        if(!props.currentStep)
            return;
        ChangesData.conflictEditor?.focusHightlightedLine(props.currentStep);
    },[props.currentStep,props.stepResetVersion])

    const handleApply=()=>{
        ChangesData.conflictEditor?.apply();
    }

    //git treats staging a conflicted file as resolving it, so this stages whatever is on disk
    const markAsResolved=()=>{
        ChangesData.conflictEditor?.apply();
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
    
    <div className="ps-2 pe-2 col-5 d-flex justify-content-end align-items-center">
        <StepNavigation  currentStep={props.currentStep} totalStep={props.totalStep}
            onNextClick={props.onNextClick} onPreviousClick={props.onPreviousClick} />
        <Dropdown>
            <Dropdown.Toggle variant="link" id="conflict_file_options" className="rounded-0 no-caret">
                <FaEllipsisV />
            </Dropdown.Toggle>
            <Dropdown.Menu className="no-radius">
                <Dropdown.Item onClick={markAsResolved}>Mark as Resolved</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    </div>
</div>
}

export const ConflictChangeNavigator = React.memo(ConflictChangeNavigatorComponent);