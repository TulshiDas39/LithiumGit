import React, { useMemo, useRef } from "react";
import { useDrag, useMultiState } from "../../lib";
import { SelectedRepoLeft } from "./SelectedRepoLeft";
import { SelectedRepoRight2 } from "./selectedRepoRight/SelectedRepoRight2";
import './SelectedRepository.scss';


interface ISelectedRepositoryProps{
    height:number;
}

interface IState{
}

function SelectedRepositoryComponent(props:ISelectedRepositoryProps){
    const[state,setState]=useMultiState<IState>({});
    const leftWidthRef = useRef(200);
    const positionRef = useRef(0);
    const {currentMousePosition:position,elementRef:resizer} = useDrag();
    const leftWidth = useMemo(()=>{
        if(!position){
            leftWidthRef.current += positionRef.current;
            positionRef.current = 0;
            return leftWidthRef.current;
        }
        positionRef.current = position.x;
        return leftWidthRef.current + positionRef.current;
    },[position?.x])

    return <div id="SelectedRepository" className="d-flex h-100">
        <div style={{width:`${leftWidth - 3}px`}}>
            <SelectedRepoLeft height={props.height}  />
        </div>
        <div ref={resizer as any} className="bg-second-color cur-resize" style={{ width: '3px' }} />
        <div style={{width:`calc(100% - ${leftWidth}px)`}} className="overflow-hidden">
            <SelectedRepoRight2 height={props.height} />
        </div>
    </div>
}

export const SelectedRepository = React.memo(SelectedRepositoryComponent);