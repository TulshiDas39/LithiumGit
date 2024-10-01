import { RendererEvents, RepositoryInfo } from "common_library";
import moment from "moment";
import React from "react"
import { Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { ActionModals, ActionSavedData } from "../../../../store/slices";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { ModalData } from "../../../modals/ModalData";
import { EnumModals } from "../../../../lib";
import { AppButton } from "../../../common";

interface ISelectedRecentRepoPropertiesProps{
    selectedItem?:RepositoryInfo;
}

function SelectedRecentRepoPropertiesComponent(props:ISelectedRecentRepoPropertiesProps){
    const dispatch = useDispatch();

    const validatePath = ()=>{
        const item = props.selectedItem!;
        const isValidPath = IpcUtils.isValidRepositoryPath(item!.path);
        if(!isValidPath){
            ModalData.confirmationModal.message = "Project does not exist. Remove this from list?";
            ModalData.confirmationModal.YesHandler = ()=>{
                dispatch(ActionSavedData.removeRepositoryFromRecentList(item));
            }
            dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
            return false;
        }

        return true;
    }
    const handleOpen = ()=>{
        const isValid = validatePath();
        if(isValid){
            dispatch(ActionSavedData.setSelectedRepository(props.selectedItem!));
        }
    }
    const handleOpenInExplorer=()=>{
        const isValid = validatePath();
        if(isValid){
           IpcUtils.showInFileExplorer(props.selectedItem?.path!);
        }
    }
    if(!props.selectedItem) return null;
    return <div className="w-25 d-flex flex-column ps-2">
        <h3 className="m-0 py-2">{props.selectedItem.name}</h3>
        <hr className="m-0" />
        <div className="py-2 d-flex justify-content-around flex-wrap">
            <div className="py-1">
                <AppButton type="success" className="px-5 py-2" onClick={handleOpen}>Open</AppButton>
            </div>
            <div className="py-1">
                <AppButton className="py-2" onClick={handleOpenInExplorer}>Open in explorer</AppButton>
            </div>            
        </div>
        {!!props.selectedItem.lastOpenedAt &&
            <span>Last opened: {moment(props.selectedItem.lastOpenedAt).fromNow()}</span>
        }
    </div>
}

export const SelectedRecentRepoProperties = React.memo(SelectedRecentRepoPropertiesComponent);