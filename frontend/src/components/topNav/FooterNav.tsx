import React from "react";

function FooterNavComponent(){
    return <div className="bg-second-color h-100 row g-0 align-items-center">
        <div className="col-2">Git Studio2</div>

    </div>
}

export const FooterNav = React.memo(FooterNavComponent);