import React from "react";
import { FirstTopNav } from "./FirstTopNav";
import { SecondTopNav } from "./secondTopNav/SecondTopNav";

function TopNavComponent(){
    return <div className="d-flex flex-column">
        <FirstTopNav />
        <SecondTopNav />
    </div>
}

export const TopNav = React.memo(TopNavComponent);