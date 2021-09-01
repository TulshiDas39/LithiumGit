import { IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { useRef } from "react"
import { useCallback } from "react";
import { useEffect } from "react";
import { UiUtils, useMultiState } from "../../../../lib";
import { ModifiedChanges } from "./ModifiedChanges";
import { StagedChanges } from "./StagedChanges";

interface IChangesProps{
    repoInfo?:RepositoryInfo;
}

interface IState {
    adjustedX: number;
    status?:IStatus;
}

function ChangesComponent(props:IChangesProps) {
    const [state, setState] = useMultiState<IState>({
        adjustedX: 0,        
    });
    const dragData = useRef({ initialX: 0, currentX: 0 });

    const getStatus=()=>{
        window.ipcRenderer.send(RendererEvents.getStatus().channel,props.repoInfo);
    }

    useEffect(()=>{
        if(props.repoInfo) getStatus();
    },[props.repoInfo]);

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.getStatus().replyChannel,(e,result:IStatus)=>{
            setState({status:result});
            console.log(result);
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getStatus().replyChannel]);
        }
    },[])

    const setAdjustedX = () => {
        setState({ adjustedX: dragData.current.currentX - dragData.current.initialX });
    }
    const handleResize = (e: React.DragEvent<HTMLDivElement>) => {
        console.log(e);
        if (dragData.current.initialX === 0) dragData.current.initialX = e.screenX;
        if (e.screenX !== 0) dragData.current.currentX = e.screenX;
        setAdjustedX();
    }
    const getAdjustedSize = (adjustedX: number) => {
        if (adjustedX > 0) return `+ ${adjustedX}px`;
        return `- ${-adjustedX}px`;
    }

    const onStatusChange = useCallback((status:IStatus)=>{
        setState({status})
    },[])

    console.log(dragData.current);

    // if(!props.repoInfo) return null;

    return <div className="d-flex w-100">
        <div className="pe-2" style={{ width: `calc(20% ${getAdjustedSize(state.adjustedX)})` }}>
            
            {
                !!state.status?.staged?.length &&
                <StagedChanges stagedChanges={state.status.staged} onStatusChange={onStatusChange} repoInfoInfo={props.repoInfo} />
            }            
            <ModifiedChanges modifiedChanges={state.status?.not_added} repoInfoInfo={props.repoInfo} 
                onStatusChange={onStatusChange} />
        </div>
        <div className="bg-info cur-resize" onDrag={handleResize} style={{ width: '3px',zIndex:2 }} />

        <div className="ps-2 bg-white" style={{ width: `calc(80% - 3px ${getAdjustedSize(-state.adjustedX)})`,zIndex:2 }}>
            Changes
        </div>
    </div>
}

export const Changes = React.memo(ChangesComponent);