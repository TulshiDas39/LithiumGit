import { INotification } from "common_library";
import React from "react"
import { FaMinus, FaTimes } from "react-icons/fa";
import { AppButton } from "../../common";

interface IProps{
    data:INotification;
}

function SingleNotificationComponent(props:IProps){
    return <div className="border ps-1 w-100 bg-second-color" style={{width:300}}>
        <div className="d-flex justify-content-end" style={{lineHeight:1.2}}>
            {/* <FaMinus /> */}
            <span className="pe-2 small">
                <FaTimes className="small" />
            </span>
        </div>
        <div className="d-flex py-2 align-items-center">
            <div className="flex-grow-1">
                {props.data.message}
            </div>
            {!!props.data.action?.buttonText && <div className="">
                <AppButton>{props.data.action?.buttonText}</AppButton>
            </div>}
        </div>
    </div>
}

export const SingleNotification = React.memo(SingleNotificationComponent);