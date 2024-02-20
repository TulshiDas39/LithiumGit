import React, { useEffect } from "react"
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { AddRemote } from "./AddRemote";
import { ActionUI } from "../../../../store/slices/UiSlice";
import { FaTrash } from "react-icons/fa";
import { IRemoteInfo } from "common_library";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { ModalData } from "../../../modals/ModalData";
import { ActionModals } from "../../../../store";
import { EnumModals } from "../../../../lib";

function RemoteListComponent(){
    const store = useSelectorTyped(state=>({
        remotes:state.ui.remotes,
    }),shallowEqual);

    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch(ActionUI.increamentVersion("remoteList"));
    },[])

    const handleRemove = (remote:IRemoteInfo)=>{
        const remoteHandler = ()=>{
            IpcUtils.removeRemote(remote.name).then(_=>{
                dispatch(ActionUI.increamentVersion("remoteList"));
            })
        }
        ModalData.confirmationModal.YesHandler = remoteHandler;
        ModalData.confirmationModal.message = "Remove remote '"+remote.name+"' ?";
        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));

    }

    return <div className="w-100 p-1">
        <div>
            <AddRemote />
        </div>
        {
            store.remotes.map(r=>(
                <div key={r.url+r.name} className="d-flex border w-100 align-items-center">
                    <div className="flex-grow-1">
                        <div className="d-flex">
                            <b className="">{r.name}</b>
                        </div>
                        <div>
                            <span>{r.url}</span>
                        </div>
                    </div>
                    <div className="pe-2">
                        <FaTrash className="text-danger hover-brighter" title="Remove" onClick={_=> handleRemove(r)} />
                    </div>
                </div>
                
            ))
        }
    </div>
}

export const RemoteList = React.memo(RemoteListComponent);