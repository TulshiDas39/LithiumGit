import React from "react";
import {FaHome} from "react-icons/fa"

function SecondTopNavComponent(){
    return <div className="d-flex bg-third-color py-2 align-items-center">
        <span className="px-2 hover">
            <FaHome className="h5 mb-0" />
        </span>
        
    </div>
}

export const SecondTopNav = React.memo(SecondTopNavComponent);