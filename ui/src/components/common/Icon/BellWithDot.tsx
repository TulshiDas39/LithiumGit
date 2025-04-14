import React from "react"
import { FaCircle, FaRegBell } from "react-icons/fa";

interface IProps{
    unread?:boolean;
}
function BellWithDotComponent(props:IProps){
    return <span className="d-flex position-relative">
        <FaRegBell />
        <FaCircle fontSize={"0.5em"} className={`position-absolute ${props.unread?'text-info':'text-secondary'}`} style={{top:-1,left:10}}/>
    </span>
}

export const BellWithDot = React.memo(BellWithDotComponent);