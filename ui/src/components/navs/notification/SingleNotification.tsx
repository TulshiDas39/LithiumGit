import React from "react"
import { FaCircle, FaMinus, FaTimes } from "react-icons/fa";
import { AppButton } from "../../common";
import { IpcUtils } from "../../../lib/utils/IpcUtils";
import { useDispatch } from "react-redux";
import { ActionUI } from "../../../store/slices/UiSlice";
import { IUiNotification } from "../../../lib";
import { EnumNotificationType, INewVersionInfo } from "common_library";

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

    const handleAction=(_e: React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        if(props.data.type === EnumNotificationType.UpdateAvailable){
            const data = props.data.data as INewVersionInfo;
            if(data?.downloaded){
                IpcUtils.installUpdate();
            }
        }
    }

    return <div className="border ps-1 w-100 bg-second-color" style={{width:300}}>
        <div className="d-flex" style={{lineHeight:1.2}}>
            {!props.data.isRead && <span className="pe-2 small">
                <FaCircle fontSize={"0.5em"} className="text-info"/>
            </span>}
            <div className="flex-grow-1 d-flex justify-content-end">
                {!!props.showMinus &&
                <span className="pe-2 small">
                    <FaMinus className="hover" onClick={handleHide} />
                </span>}
                <span className="pe-2 small">
                    <FaTimes className="small hover" onClick={handleRemove} />
                </span>
            </div>
            
        </div>
        <div className="d-flex pt-2 pb-1 align-items-center">
            <div className="flex-grow-1 align-self-start">
                {props.data.message}
            </div>
            {!!props.data.action?.buttonText && <div className="pe-1 small">
                <AppButton onClick={handleAction}>{props.data.action?.buttonText}</AppButton>
            </div>}
        </div>
    </div>
}

export const SingleNotification = React.memo(SingleNotificationComponent);