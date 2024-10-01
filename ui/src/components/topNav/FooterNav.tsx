import React from "react";
import { shallowEqual } from "react-redux";
import { BarLoader } from "react-spinners";
import { useSelectorTyped } from "../../store/rootReducer";
import { FaSpinner } from "react-icons/fa";
import { ProgressBar } from "react-bootstrap";

function FooterNavComponent(){
    const store = useSelectorTyped(state=>({
        loader:state.ui.loaders,
        sync:state.ui.synch,
    }),shallowEqual);

    return <div className="bg-second-color h-100 row g-0 align-items-center">
        <div className="col-5">
            <div className="d-flex">
                <span>LithiumGit</span>
                {!!store.sync && (
                    <div className="ps-3 d-flex align-items-center">
                        <FaSpinner className="spinner" />
                        <span className="ps-2">{store.sync.text}</span>
                    </div>
                )}
            </div>            
        </div>      
        <div className="col-auto text-center">
            <div className="text-center">                
                    {!!store.loader?.length && <ProgressBar className="" style={{width:300}} animated now={100} variant="success" key={1} label="" />}                
            </div>
        </div>
        <div className="col-auto ps-3">
            {!!store.loader?.length && <span>{store.loader[store.loader.length-1].text}</span>}
        </div>
    </div>
}

export const FooterNav = React.memo(FooterNavComponent);