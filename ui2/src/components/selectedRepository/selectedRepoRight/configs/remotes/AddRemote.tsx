import React from "react";
import { useMultiState } from "../../../../../lib";
import { AppButton } from "../../../../common";
import { Form } from "react-bootstrap";
import { IpcUtils } from "../../../../../lib/utils/IpcUtils";
import { IRemoteInfo } from "common_library";
import { shallowEqual, useDispatch } from "react-redux";
import { ActionUI } from "../../../../../store/slices/UiSlice";
import { useSelectorTyped } from "../../../../../store/rootReducer";

interface IState{
    adding:boolean;
    url:string;
    name:string;
}
function AddRemoteComponent(){
    const [state,setState]=useMultiState<IState>({adding:false,url:"",name:""});
    const store = useSelectorTyped(state=>({
        remotes:state.ui.remotes,
    }),shallowEqual);

    const dispatch = useDispatch();
    const handleAdd = ()=>{
        if(!state.name || !state.url)
            return ;
        if(store.remotes.some(_=>_.name === state.name))
            return;
        const newRemote:IRemoteInfo = {name:state.name,url:state.url,actionTyps:["fetch","push"]};
        IpcUtils.addRemote(newRemote).then(_=>{
            dispatch(ActionUI.increamentVersion("remoteList"));
            setState({adding:false});
        });
    }
    return <div className="w-100">
        <div className="d-flex pt-2 pb-3 justify-content-center">
            {
                !state.adding && <AppButton text="Add new remote" type="default" onClick={()=> setState({adding:true})} />
            }
        </div>
        
        {state.adding && (
            <div >
                <div className="d-flex py-1">
                    <Form.Label>Name: </Form.Label>
                    <Form.Control type="text" onChange={e=>setState({name:e.target.value})} value={state.name} />
                </div>
                <div className="d-flex">
                    <Form.Label className="pe-2">Url: </Form.Label>
                    <Form.Control type="text" onChange={e=>setState({url:e.target.value})} value={state.url} />                    
                </div>
                <div className="d-flex justify-content-center py-1">
                    <AppButton text="Add" type="default" onClick={handleAdd} />
                    <span className="px-1" />
                    <AppButton text="Cancel" type="danger" onClick={()=>setState({adding:false})} />
                </div>
            </div>
            
        )}
    </div>
}

export const AddRemote = React.memo(AddRemoteComponent);