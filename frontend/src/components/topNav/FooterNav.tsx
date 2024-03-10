import React from "react";
import { shallowEqual } from "react-redux";
import { BarLoader } from "react-spinners";
import { useSelectorTyped } from "../../store/rootReducer";

function FooterNavComponent(){
    const store = useSelectorTyped(state=>({
        loader:state.ui.loader,
    }),shallowEqual);

    return <div className="bg-second-color h-100 row g-0 align-items-center">
        <div className="col-2">
            <span>OpenGit</span> 
        </div>
        <div className="col-3"></div>
        <div className="col-auto text-center">
            <div className="text-center">                
                    {store.loader && <BarLoader />}                
            </div>
        </div>
        <div className="col-auto ps-3">
            {store.loader && <span>{store.loader.text}</span>}
        </div>
    </div>
}

export const FooterNav = React.memo(FooterNavComponent);