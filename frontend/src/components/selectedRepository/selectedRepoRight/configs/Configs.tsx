import React from "react"
import { ConfigLeft } from "./ConfigLeft";

function ConfigsComponent(){
    return <div className="d-flex h-100 w-100">
        <ConfigLeft />
    </div>
}

export const Configs = React.memo(ConfigsComponent);