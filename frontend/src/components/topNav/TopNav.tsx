import React from "react";
import { FirstTopNav } from "./FirstTopNav";
import { SecondTopNav } from "./SecondTopNav";

function TopNavComponent(){
    return <div className="d-flex flex-column">
        <FirstTopNav />
        <SecondTopNav />
    </div>
}

export const TopNav = React.memo(TopNavComponent);