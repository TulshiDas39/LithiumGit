import React, { useEffect, useRef } from "react"
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { useMultiState } from "../../../../lib";
import { ITypedConfig, IUserConfig } from "common_library";
import { Form } from "react-bootstrap";
import { ModalData } from "../../../modals/ModalData";
import { useDispatch } from "react-redux";
import { ActionModals } from "../../../../store";
import { SingleProperty } from "./SingleProperty";


interface IRefData{
    isMounted:boolean;
}

interface IState{
    showingGlobal:boolean;
    user?:ITypedConfig<IUserConfig>;
}


function UserConfigComponent(){
    const initialState:IState = {showingGlobal:false};
    const [state,setState] = useMultiState<IState>(initialState);
    const dispatch = useDispatch();
    const refData = useRef<IRefData>({isMounted:false});    

    const getValue = (key:keyof IUserConfig)=>{
        if(state.showingGlobal)
            return state.user?.global[key] || "";
        return state.user?.local[key] || state.user?.global[key] || "";
    }
    
    const toogleGlobalMode=()=>{
        setState({showingGlobal:!state.showingGlobal});
    }

    useEffect(()=>{
        if(!refData.current.isMounted)
            return;
        ModalData.appToast.message = `Global mode is turned ${state.showingGlobal?'on':'off'}`;
        dispatch(ActionModals.showToast());
    },[state.showingGlobal]);

    useEffect(()=>{
        refData.current.isMounted = true;
        IpcUtils.getUserConfig().then(r=>{
            if(!r.error){
                setState({user:r.result});
            }
        });
    },[])

    return <div className="p-2 h-100 w-100">
        <div className="d-flex align-items-center justify-content-end">
            <span className="">Show global values</span>
            <span className="ps-2">
                <Form.Switch checked={state.showingGlobal} onChange={_=> toogleGlobalMode()} />
            </span>
        </div>
        <SingleProperty name="User name" value={getValue("name")} />
        <SingleProperty name="Email" value={getValue("email")} />        
    </div>
}

export const UserConfig = React.memo(UserConfigComponent);