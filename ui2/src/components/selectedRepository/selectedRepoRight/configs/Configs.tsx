import React from "react"
import { ConfigLeft } from "./ConfigLeft";
import { ConfigRight } from "./ConfigRight";

function ConfigsComponent(){
    return <div className="d-flex h-100 w-100">
        <ConfigLeft />
        <ConfigRight />
    </div>
}

export const Configs = React.memo(ConfigsComponent);