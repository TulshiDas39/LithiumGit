import React, { useEffect } from "react"
import { shallowEqual, useDispatch } from "react-redux";
import { useSelectorTyped } from "../../../store/rootReducer";
import { ChangeUtils } from "../../../lib/utils/ChangeUtils";
import { ModifiedChangeNavigator } from "./ModifiedChangeNavigator";
import { EnumChangeGroup } from "common_library";
import { ActionChanges } from "../../../store";
import { StagedChangeNavigator } from "./StagedChangeNavigator";
import { ConflictChangeNavigator } from "./ConflictChangeNavigator";

function ChangeNavigatorComponent(){
    const store = useSelectorTyped(state=> state.changes,shallowEqual);
    const dispatch = useDispatch();
    useEffect(()=>{
        if(!store?.currentStep)
            return;
        ChangeUtils.FocusHightlightedLine(store.currentStep);
    },[store?.currentStep])

    const onNextClick=()=>{
        if(store.currentStep >= store.totalStep)
            return;
        dispatch(ActionChanges.updateData({currentStep:store.currentStep + 1}));
    }

    const onPreviousClick = ()=>{
        if(store.currentStep <= 1)
            return;
        dispatch(ActionChanges.updateData({currentStep:store.currentStep - 1}));
    }

    if(!store?.selectedFile) return null;

    return <div className="flex-grow-1 ps-3">
        {store.selectedFile.changeGroup === EnumChangeGroup.UN_STAGED &&
            <ModifiedChangeNavigator selectedFile={store.selectedFile} 
            currentStep={store.currentStep} totalStep={store.totalStep} onNextClick={onNextClick}
            onPreviousClick={onPreviousClick}/>}

            {store.selectedFile.changeGroup === EnumChangeGroup.STAGED &&
            <StagedChangeNavigator selectedFile={store.selectedFile} 
            currentStep={store.currentStep} totalStep={store.totalStep} onNextClick={onNextClick}
            onPreviousClick={onPreviousClick}/>}

            {store.selectedFile.changeGroup === EnumChangeGroup.CONFLICTED &&
            <ConflictChangeNavigator selectedFile={store.selectedFile} 
            currentStep={store.currentStep} totalStep={store.totalStep} onNextClick={onNextClick}
            onPreviousClick={onPreviousClick}/>}
    </div>
}


export const ChangeNavigator = React.memo(ChangeNavigatorComponent);