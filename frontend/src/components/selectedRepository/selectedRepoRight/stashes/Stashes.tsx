import { IStash } from "common_library";
import React, { useEffect, useMemo, useRef } from "react";
import { useDrag, useMultiState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";

interface IState{
    stashes:IStash[];
    selectedItem?:IStash;
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
    
    const bottomHeightRef = useRef(200);
    const positionRef = useRef(0);
    const {currentMousePosition:position,elementRef:resizer} = useDrag();

    const bottomHeight = useMemo(()=>{
        const curHeight = bottomHeightRef.current - positionRef.current;
        const height = Math.max(50, curHeight);
        if(!position){
            bottomHeightRef.current = height;
            positionRef.current = 0;
        }
        else{
            positionRef.current = position.y;
        }
        return height;
    },[position?.y])

    return <div className="px-2 pt-2 h-100 w-100">
        <div className="w-100" style={{height:`calc(100% - ${bottomHeight+3}px)`}}>
            {state.stashes.map((st,i)=>(
                <div key={i} className="hover" onClick={()=> setState({selectedItem:st})}>
                    {`{${i}} ${st.message}`}
                </div>
            ))}
        </div>
        <div ref={resizer as any} className="bg-second-color cur-resize-v" style={{ height: '3px' }} />
        <div className="w-100 bg-success" style={{height:`${bottomHeight}px`}}>

        </div>
        
    </div>
}

export const Stashes = React.memo(StashesComponent);