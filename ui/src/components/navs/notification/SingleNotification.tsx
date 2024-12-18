import React from "react"
import { FaMinus, FaTimes } from "react-icons/fa";

interface IProps{
    data:{message:string};
}

function SingleNotificationComponent(props:IProps){
    return <div className="border pb-2 ps-1 w-100 bg-second-color" style={{width:300}}>
        <div className="d-flex justify-content-end" style={{lineHeight:1.2}}>
            {/* <FaMinus /> */}
            <span className="pe-2 small">
                <FaTimes className="small" />
            </span>
        </div>
        <div>
            {props.data.message}
        </div>
    </div>
}

export const SingleNotification = React.memo(SingleNotificationComponent);