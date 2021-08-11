import React from "react";

function MainComponent(){
    return <div>
        main
    </div>
}

export const Main = React.memo(MainComponent);