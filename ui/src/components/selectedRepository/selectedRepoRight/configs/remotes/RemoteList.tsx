import React, { useEffect } from "react"
import { useSelectorTyped } from "../../../../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { AddRemote } from "./AddRemote";
import { ActionUI } from "../../../../../store/slices/UiSlice";
import { FaEllipsisH, FaPen, FaTrash } from "react-icons/fa";
import { IRemoteInfo } from "common_library";
import { IpcUtils } from "../../../../../lib/utils/IpcUtils";
import { ModalData } from "../../../../modals/ModalData";
import { ActionModals, ActionSavedData } from "../../../../../store";
import { EnumModals, UiUtils, useMultiState } from "../../../../../lib";
import { Dropdown, Form } from "react-bootstrap";
import { AppButton } from "../../../../common";

interface ISingleRemoteProps{
    url:string;
    name:string;
    handleRemove:()=>void;
    onUpdate:(url:string)=>void;
    isDefault:boolean;
}

interface ISingleRemoteState{
    isEditing:boolean;
    value:string;
    rightWidth:number;
    leftWidth?:string;
}

function SingleRemote(props:ISingleRemoteProps){
    const rightWidth  = 130;
    const [state,setState] = useMultiState<ISingleRemoteState>({isEditing:false,
        value:props.url,
        rightWidth:rightWidth,
        leftWidth:`calc(100% - ${rightWidth}px)`
    });
    const dispatch = useDispatch();

    // const refData = useRef({rightWidht:120});
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
    useEffect(()=>{
        if(state.isEditing){
            setState({leftWidth:'100%'})
        }else{
            setState({leftWidth:`calc(100% - ${rightWidth}px)`})
        }
    },[state.isEditing])

    const copyUrl = ()=>{
        UiUtils.copy(props.url);
        ModalData.appToast.message = "Copied.";
        dispatch(ActionModals.showToast());
    }

    const setAsDefault=()=>{
        dispatch(ActionSavedData.setActiveOrigin(props.name));
    }


    return <div className="d-flex border w-100 align-items-center">
    <div style={{width:state.leftWidth}} className="overflow-hidden">
        <div className="d-flex">
            <b className="">{props.name}</b>
            {props.isDefault && <span className="small ps-1">(default)</span>}
        </div>
        <div className="w-100 overflow-ellipsis">
            {!state.isEditing && <span className="w-100">{props.url}</span>}
            {state.isEditing && 
            <div className="d-flex align-items-center pt-1">
                <Form.Control type="text" value={state.value} onChange={e=> setState({value:e.target.value})} />

                <div className="px-2 d-flex align-items-center">
                    <span className="pe-3">
                        <AppButton text="Save" className="text-primary" onClick={()=> handleSave()}/>
                    </span>
                    <AppButton text="Cancel" className="text-danger hover-shadow hover-brighter" title="Remove" onClick={_=> handleCancel()} />
                </div>
            </div>
            }
        </div>
    </div>
    {!state.isEditing && <div className="ps-4 pe-2 d-flex align-items-center justify-content-end" style={{width:state.rightWidth }}>
        
        <span className="">
            <FaPen className="text-primary" onClick={()=> setState({isEditing:true})}/>
        </span>
        <span className="px-3">
            <FaTrash className="text-danger hover-brighter" title="Remove" onClick={_=> handleRemove()} />
        </span>
        <Dropdown>
            <Dropdown.Toggle variant="link" id="remote_item_more" className="rounded-0 no-caret">
                <FaEllipsisH />
            </Dropdown.Toggle>
            <Dropdown.Menu className="no-radius">
                <Dropdown.Item onClick={() => setAsDefault()} className="">Set as default</Dropdown.Item>
                <Dropdown.Item onClick={() => copyUrl()} className="">Copy url</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    </div>}    

</div>
}

function RemoteListComponent(){
    const store = useSelectorTyped(state=>({
        remotes:state.ui.remotes,
        activeOrigin:state.savedData.recentRepositories.find(_=>_.isSelected)?.activeOrigin,
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
                    onUpdate={(url)=> handleUpdate(r,url)}
                    isDefault={store.activeOrigin === r.name} />
            ))
        }
    </div>
}

export const RemoteList = React.memo(RemoteListComponent);