import React from "react"
import { FaCircle, FaRegBell } from "react-icons/fa";

function BellWithDotComponent(){
    return <span className="d-flex position-relative">
        <FaRegBell />
        <FaCircle fontSize={"0.5em"} className="position-absolute" style={{top:-1,left:10}}/>
    </span>
}

export const BellWithDot = React.memo(BellWithDotComponent);