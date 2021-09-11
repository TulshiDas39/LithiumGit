import React, { useRef } from "react";
import { FirstTopNav } from "./FirstTopNav";
import { SecondTopNav } from "./secondTopNav/SecondTopNav";

function TopNavComponent(){
    const data = useRef({firstTopNavHeightPercent:30})
    return <div className="d-flex flex-column h-100 w-100">
        <div style={{height:`${data.current.firstTopNavHeightPercent}%`}}>
            <FirstTopNav />
        </div>
        <div style={{height:`${100 - data.current.firstTopNavHeightPercent}%`}}>
            <SecondTopNav />
        </div>
    </div>
}

export const TopNav = React.memo(TopNavComponent);