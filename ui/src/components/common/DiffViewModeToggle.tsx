import React from "react";
import { useDispatch } from "react-redux";
import { EnumDiffViewMode } from "common_library";
import { FaAlignLeft, FaColumns } from "react-icons/fa";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionSavedData } from "../../store";

interface IProps{
    onToggle?:()=>void;
}

function DiffViewModeToggleComponent(props:IProps){
    const viewMode = useSelectorTyped(state=>state.savedData.configInfo.diffViewMode);
    const dispatch = useDispatch();
    const isUnified = viewMode === EnumDiffViewMode.Unified;

    const handleClick = ()=>{
        dispatch(ActionSavedData.setDiffViewMode(isUnified ? EnumDiffViewMode.Split : EnumDiffViewMode.Unified));
        props.onToggle?.();
    }

    return <span className="hover cur-point" title={isUnified?"Switch to split view":"Switch to unified view"} onClick={handleClick}>
        {isUnified ? <FaColumns /> : <FaAlignLeft />}
    </span>
}

export const DiffViewModeToggle = React.memo(DiffViewModeToggleComponent);
