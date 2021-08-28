import React from "react"

function ChangesComponent(){
    return <div>
        Changes
    </div>
}

export const Changes = React.memo(ChangesComponent);