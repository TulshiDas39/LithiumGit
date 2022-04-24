import React from "react"
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { shallowEqual, useDispatch } from "react-redux";
import { useSelectorTyped } from "../../../store/rootReducer";
import { ActionUI } from "../../../store/slices/UiSlice";

function ChangeNavigatorComponent(){
    const store = useSelectorTyped(state=> state.ui.changes,shallowEqual);
    const dispatch = useDispatch();

    if(!store) return null;
    const handleUp=()=>{
        if(store.currentStep > 1) dispatch(ActionUI.setComparableStep(store.currentStep-1));
    }

    const handleDown=()=>{
        if(store.currentStep < store.totalStep) dispatch(ActionUI.setComparableStep(store.currentStep+1));
    }

    return <div className="justify-content-center align-items-center flex-grow-1 d-flex"> 
        <span>Showing {store.currentStep}/{store.totalStep}</span>
        <span className="px-1" />
        <span>
            <FaArrowUp className="cur-point" onClick={handleUp}/>
        </span>
        <span className="px-1" />
        <span>
            <FaArrowDown className="cur-point" onClick={handleDown} />
        </span>
    </div>
}


export const ChangeNavigator = React.memo(ChangeNavigatorComponent);