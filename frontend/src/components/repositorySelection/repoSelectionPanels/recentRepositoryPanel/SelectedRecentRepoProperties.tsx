import { RendererEvents, RepositoryInfo } from "common_library";
import moment from "moment";
import React from "react"
import { Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { ActionSavedData } from "../../../../store/slices";

interface ISelectedRecentRepoPropertiesProps{
    selectedItem?:RepositoryInfo;
}

function SelectedRecentRepoPropertiesComponent(props:ISelectedRecentRepoPropertiesProps){
    const dispatch = useDispatch();
    const handleOpen = ()=>{
        dispatch(ActionSavedData.setSelectedRepository(props.selectedItem!));
    }
    const handleOpenInExplorer=()=>{
        window.ipcRenderer.send(RendererEvents.openFileExplorer,props.selectedItem?.path);
    }
    if(!props.selectedItem) return null;
    return <div className="w-25 d-flex flex-column ps-2">
        <h3 className="m-0 py-2">{props.selectedItem.name}</h3>
        <hr className="m-0" />
        <div className="py-2">
            <Button className="px-5" onClick={handleOpen}>Open</Button>
            <span className="px-1" />
            <Button className="px" onClick={handleOpenInExplorer}>Open in explorer</Button>
            
        </div>
        {!!props.selectedItem.lastOpenedAt &&
            <span>Last opened: {moment(props.selectedItem.lastOpenedAt).fromNow()}</span>
        }
    </div>
}

export const SelectedRecentRepoProperties = React.memo(SelectedRecentRepoPropertiesComponent);