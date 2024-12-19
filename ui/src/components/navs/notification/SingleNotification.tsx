import { INotification } from "common_library";
import React from "react"
import { FaMinus, FaTimes } from "react-icons/fa";
import { AppButton } from "../../common";
import { IpcUtils } from "../../../lib/utils/IpcUtils";
import { useDispatch } from "react-redux";
import { ActionUI } from "../../../store/slices/UiSlice";
import { IUiNotification } from "../../../lib";

interface IProps{
    data:IUiNotification;
    showMinus?:boolean;
}

function SingleNotificationComponent(props:IProps){
    const dispatch = useDispatch();

    const handleRemove=()=>{
        IpcUtils.deleteNotification([props.data]).then(r=>{
            if(!r.error){
                dispatch(ActionUI.increamentVersion("notifications"))
            }
        });
    }
    const handleHide=()=>{
        dispatch(ActionUI.deactivateNotification(props.data._id));
    }

    return <div className="border ps-1 w-100 bg-second-color" style={{width:300}}>
        <div className="d-flex justify-content-end" style={{lineHeight:1.2}}>
            {!!props.showMinus &&
            <span className="pe-2 small">
                <FaMinus onClick={handleHide} />
            </span>}
            <span className="pe-2 small">
                <FaTimes className="small hover" onClick={handleRemove} />
            </span>
        </div>
        <div className="d-flex pt-2 pb-1 align-items-center">
            <div className="flex-grow-1 align-self-start">
                {props.data.message}
            </div>
            {!!props.data.action?.buttonText && <div className="pe-1 small">
                <AppButton>{props.data.action?.buttonText}</AppButton>
            </div>}
        </div>
    </div>
}

export const SingleNotification = React.memo(SingleNotificationComponent);