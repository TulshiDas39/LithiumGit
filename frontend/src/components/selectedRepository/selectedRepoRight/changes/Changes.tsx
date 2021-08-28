import React, { useRef } from "react"
import { useMultiState } from "../../../../lib";

interface IState{
    adjustedX:number;
}

function ChangesComponent(){
    const [state,setState] = useMultiState<IState>({adjustedX:0})
    const dragData = useRef({initialX:0,currentX:0});
    // useEffect(()=>{
    //     initialDragData.current.clientX
    // },[])
    const setAdjustedX=()=>{
        setState({adjustedX:dragData.current.currentX - dragData.current.initialX});
    }
    const handleResize = (e: React.DragEvent<HTMLDivElement>)=>{
        console.log(e);
        if(dragData.current.initialX === 0) dragData.current.initialX = e.screenX;
        if(e.screenX !== 0) dragData.current.currentX = e.screenX;
        setAdjustedX();
    }
    const getAdjustedSize=(adjustedX:number)=>{
        if(adjustedX > 0) return `+ ${adjustedX}px`;
        return `- ${-adjustedX}px`;
    }
    console.log(dragData.current);

    return <div className="d-flex w-100">
        <div className="pe-2" style={{width:`calc(20% ${getAdjustedSize(state.adjustedX)})`}}>
            Files
        </div>
        <div className="bg-info cur-resize" onDrag={handleResize} style={{width:'3px'}}>

        </div>
        <div className="ps-2" style={{width:`calc(80% - 3px ${getAdjustedSize(-state.adjustedX)})`}}>
            Changes
        </div>
    </div>
}

export const Changes = React.memo(ChangesComponent);