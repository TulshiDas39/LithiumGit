import React, { useEffect } from "react"
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { IScopedValue, ObjectUtils, useMultiState } from "../../../../lib";
import { IUserConfig } from "common_library";



interface IState extends Record<keyof IUserConfig, IScopedValue<string>>{

}


function UserConfigComponent(){
    const initialState:IState = {email:{value:"", isGlobal:false},name:{value:"",isGlobal:false}}
    const [state,setState] = useMultiState<IState>(initialState);
        
    useEffect(()=>{
        IpcUtils.getUserConfig().then(r=>{
            if(!r.error){
                const mapped = new ObjectUtils().mapToScopedValue(r.result!);
                setState({...mapped});
            }
        });
    },[])

    const headerWidth = 100;

    return <div className="p-2 h-100 w-100">
        <div className="d-flex config-item">
            <span className="config-header" style={{width:`${headerWidth}px`}}>
                User name:
            </span>
            <span className="config-value">{state.name.value}</span>
        </div>
        <div className="d-flex config-item">
            <span className="config-header">
                Email:
            </span>
            <span className="config-value">{state.email.value}</span>
        </div>
        <div>

        </div>
    </div>
}

export const UserConfig = React.memo(UserConfigComponent);