import { IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { useRef } from "react"
import { useCallback } from "react";
import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { UiUtils, useMultiState } from "../../../../lib";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { Difference } from "./Difference";
import { ModifiedChanges } from "./ModifiedChanges";
import { SelectedFile } from "./SelectedFile";
import { StagedChanges } from "./StagedChanges";
import { UntrackedFiles } from "./UntrackedFiles";

interface IChangesProps{
    repoInfo?:RepositoryInfo;
}

interface IState {
    adjustedX: number;
    status?:IStatus;
    selectedFilePath?:string;
}

function ChangesComponent(props:IChangesProps) {
    const [state, setState] = useMultiState<IState>({
        adjustedX: 0,        
    });

    const store = useSelectorTyped(state=>({
        focusVersion:state.ui.versions.appFocused,
    }),shallowEqual);

    const dragData = useRef({ initialX: 0, currentX: 0 });

    const getStatus=()=>{
        if(props.repoInfo) window.ipcRenderer.send(RendererEvents.getStatus().channel,props.repoInfo);
    }

    useEffect(()=>{
         getStatus();
    },[props.repoInfo]);

    useEffect(()=>{
        getStatus();
    },[store.focusVersion])

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.getStatus().replyChannel,(e,result:IStatus)=>{
            setState({status:result});
        });
        window.ipcRenderer.on(RendererEvents.stageItem().replyChannel,(_,res:IStatus)=>{
            setState({status:res});
        });
        window.ipcRenderer.on(RendererEvents.discardItem().replyChannel,(_,res:IStatus)=>{
            setState({status:res});
        });
        return ()=>{
            UiUtils.removeIpcListeners([
                RendererEvents.getStatus().replyChannel,
                RendererEvents.discardItem().replyChannel,
                RendererEvents.stageItem().replyChannel,
            ]);
        }
    },[])

    const getAdjustedSize = (adjustedX: number) => {
        if (adjustedX > 0) return `+ ${adjustedX}px`;
        return `- ${-adjustedX}px`;
    }

    const onStatusChange = useCallback((status:IStatus)=>{
        setState({status})
    },[])

    const handleSelect = useCallback((path:string)=>{
        setState({selectedFilePath:path});
    },[])
    const handleMoseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        e.preventDefault();
        if(!dragData.current.initialX) dragData.current.initialX = e.pageX;
        function resize(e: MouseEvent) {
            dragData.current.currentX = e.pageX;
            setState({adjustedX:dragData.current.currentX-dragData.current.initialX});        
        }
        function stopResize() {
            window.removeEventListener('mousemove', resize);
        }
        window.addEventListener('mousemove', resize);        
        window.addEventListener('mouseup', stopResize);

    }

    
      
    

    // if(!props.repoInfo) return null;

    return <div className="d-flex w-100">
        <div className="pe-2" style={{ width: `calc(20% ${getAdjustedSize(state.adjustedX)})` }}>
            
            
            {
                !!state.status?.staged?.length &&
                <StagedChanges stagedChanges={state.status.staged} onStatusChange={onStatusChange} repoInfoInfo={props.repoInfo} />
            }            
            <ModifiedChanges modifiedChanges={state.status?.not_added} repoInfoInfo={props.repoInfo} 
                onStatusChange={onStatusChange} onFileSelect={handleSelect} selectedFilePath={state.selectedFilePath} />
            
            {
                !!state.status?.created?.length &&
                <UntrackedFiles onFileSelect={handleSelect} files={state.status.created} 
                onStatusChange={onStatusChange} repoInfoInfo={props.repoInfo} />
            }
        </div>
        <div className="bg-info cur-resize" onMouseDown={handleMoseDown} style={{ width: '3px',zIndex:2 }} />

        <div className="ps-2 bg-white" style={{ width: `calc(80% - 3px ${getAdjustedSize(-state.adjustedX)})`,zIndex:2 }}>
            {!!state.selectedFilePath && <Difference path={state.selectedFilePath} />}
        </div>
    </div>
}

export const Changes = React.memo(ChangesComponent);