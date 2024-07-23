import React, { useEffect, useRef } from "react"
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { IScopedValue, ObjectUtils, useMultiState } from "../../../../lib";
import { ITypedConfig, IUserConfig } from "common_library";
import { Form } from "react-bootstrap";


interface IRefData{
    user?:ITypedConfig<IUserConfig>;
}

interface IState{
    showingGlobal:boolean;
    user?:ITypedConfig<IUserConfig>;
}


function UserConfigComponent(){
    const initialState:IState = {showingGlobal:false};
    const [state,setState] = useMultiState<IState>(initialState);

    const refData = useRef<IRefData>({})
        
    useEffect(()=>{
        IpcUtils.getUserConfig().then(r=>{
            if(!r.error){
                refData.current.user = r.result;
                setState({user:r.result});
            }
        });
    },[])

    const getValue = (key:keyof IUserConfig)=>{
        if(state.showingGlobal)
            return state.user?.global[key];
        return state.user?.local[key] || state.user?.global[key];
    }    

    return <div className="p-2 h-100 w-100">
        <div className="d-flex align-items-center justify-content-end">
            <span className="">Show global configs</span>
            <span className="ps-2">
                <Form.Switch checked={state.showingGlobal} onChange={_=> setState({showingGlobal:!state.showingGlobal})} />
            </span>
        </div>
        <div className="d-flex config-item">
            <span className="config-header">
                User name:
            </span>
            <span className="config-value">
                <span>{getValue("name")}</span>
            </span>
        </div>
        <div className="d-flex config-item">
            <span className="config-header">
                Email:
            </span>
            <span className="config-value">
                <span>
                    {getValue("email")}
                </span>

            </span>
        </div>
    </div>
}

export const UserConfig = React.memo(UserConfigComponent);