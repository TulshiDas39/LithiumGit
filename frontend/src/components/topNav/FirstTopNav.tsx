import React from "react";

function FirstTopNavComponent(){
    return <div className="bg-second-color h-100">
        <span>Git Studio</span>
    </div>
}

export const FirstTopNav = React.memo(FirstTopNavComponent);