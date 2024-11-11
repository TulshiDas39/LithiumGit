import React, { useEffect } from "react"
import { useSelectorTyped } from "../../../../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { AddRemote } from "./AddRemote";
import { ActionUI } from "../../../../../store/slices/UiSlice";
import { FaPen, FaTrash } from "react-icons/fa";
import { IRemoteInfo } from "common_library";
import { IpcUtils } from "../../../../../lib/utils/IpcUtils";
import { ModalData } from "../../../../modals/ModalData";
import { ActionModals } from "../../../../../store";
import { EnumModals, useMultiState } from "../../../../../lib";
import { Form } from "react-bootstrap";
import { AppButton } from "../../../../common";

interface ISingleRemoteProps{
    url:string;
    name:string;
    handleRemove:()=>void;
    onUpdate:(url:string)=>void;

}

interface ISingleRemoteState{
    isEditing:boolean;
    value:string;
}

function SingleRemote(props:ISingleRemoteProps){
    const [state,setState] = useMultiState<ISingleRemoteState>({isEditing:false,value:props.url});
    const dispatch = useDispatch();
    const handleSave = ()=>{
        setState({isEditing:false});
        props.onUpdate(state.value);
    }

    const handleCancel = ()=>{
        setState({isEditing:false,value:props.url});
    }

    const handleRemove=()=>{
        const yesHandler = ()=>{
            props.handleRemove();
        }
        ModalData.confirmationModal.YesHandler = yesHandler;
        ModalData.confirmationModal.message = "Remove remote '"+props.name+"' ?";
        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
    }

    useEffect(()=>{
        setState({value:props.url});
    },[props.url]);

    return <div className="d-flex border w-100 align-items-center">
    <div className="flex-grow-1">
        <div className="d-flex">
            <b className="">{props.name}</b>
        </div>
        <div>
            {!state.isEditing && <span>{props.url}</span>}
            {state.isEditing && 
            <div className="d-flex align-items-center pt-1">
                <Form.Control type="text" value={state.value} onChange={e=> setState({value:e.target.value})} />

                <div className="px-2 d-flex align-items-center">
                    <span className="pe-3">
                        <AppButton text="Save" className="text-primary" onClick={()=> handleSave()}/>
                    </span>
                    <AppButton text="Cancel" className="text-danger hover-brighter" title="Remove" onClick={_=> handleCancel()} />
                </div>
            </div>
            }
        </div>
    </div>
    {!state.isEditing && <div className="px-2">
        <span className="pe-3">
            <FaPen className="text-primary" onClick={()=> setState({isEditing:true})}/>
        </span>
        <FaTrash className="text-danger hover-brighter" title="Remove" onClick={_=> handleRemove()} />
    </div>}    

</div>
}

function RemoteListComponent(){
    const store = useSelectorTyped(state=>({
        remotes:state.ui.remotes,
    }),shallowEqual);

    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch(ActionUI.increamentVersion("remoteList"));
    },[])

    const handleRemove = (remote:IRemoteInfo)=>{
        IpcUtils.removeRemote(remote.name).then(_=>{
            dispatch(ActionUI.increamentVersion("remoteList"));
        })        
    }

    const handleUpdate = (remote:IRemoteInfo, url:string)=>{
        IpcUtils.runRemote(["set-url",remote.name,url]).then(_=>{
            dispatch(ActionUI.increamentVersion("remoteList"));
        });
    }

    return <div className="w-100 p-1">
        <div>
            <AddRemote />
        </div>
        {
            store.remotes.map(r=>(
                <SingleRemote key={r.url+r.name} handleRemove={()=> handleRemove(r)} name={r.name} url={r.url}
                    onUpdate={(url)=> handleUpdate(r,url)} />
            ))
        }
    </div>
}

export const RemoteList = React.memo(RemoteListComponent);