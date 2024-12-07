import React from "react"
import { FaBuffer } from "react-icons/fa";

function GraphFilterComponent(){
    return <div>
        <span>
            <FaBuffer />
        </span>
    </div>
}

export const GraphFilter = React.memo(GraphFilterComponent);