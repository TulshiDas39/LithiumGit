import React from "react"
import { shallowEqual } from "react-redux";
import { useSelectorTyped } from "../../../store/rootReducer";

function ChangeNavigatorComponent(){
    const store = useSelectorTyped(state=> state.ui.changes,shallowEqual);

    if(!store) return null;
    return <div className="justify-content-center flex-grow-1 d-flex"> 
        <span>Showing {store.currentStep}/{store.totalStep}</span>
        <span>
        <i className="fa-solid fa-up"></i>
        </span>
    </div>
}


export const ChangeNavigator = React.memo(ChangeNavigatorComponent);