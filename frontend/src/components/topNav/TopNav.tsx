import React, { useRef } from "react";
import { SecondTopNav } from "./secondTopNav/SecondTopNav";

function TopNavComponent(){
    const data = useRef({firstTopNavHeightPercent:30})
    return <div className="d-flex flex-column h-100 w-100">
        <div className="h-100">
            <SecondTopNav />
        </div>
    </div>
}

export const TopNav = React.memo(TopNavComponent);