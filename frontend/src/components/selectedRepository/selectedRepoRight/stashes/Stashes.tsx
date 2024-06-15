import { IStash } from "common_library";
import React, { useEffect } from "react";
import { useMultiState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";

interface IState{
    stashes:IStash[];
}

function StashesComponent(){
    const [state,setState] = useMultiState<IState>({
        stashes:[],
    });

    useEffect(()=>{
        IpcUtils.getStashes().then(res=>{
            console.log("res",res);
            if(res.result){
                console.log("res",res.result);
                setState({stashes:res.result});
            }
        });
    },[])
    return <div className="px-2 pt-2">
        {state.stashes.map((st,i)=>(
            <div key={i}>
                {`{${i}} ${st.message}`}
            </div>
        ))}
    </div>
}

export const Stashes = React.memo(StashesComponent);