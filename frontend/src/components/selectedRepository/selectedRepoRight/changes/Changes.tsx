import { IStatus, RendererEvents } from "common_library";
import React, { Fragment, useMemo, useRef } from "react"
import { useCallback } from "react";
import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { EnumChangesType, EnumSelectedRepoTab, ReduxUtils, UiUtils, useMultiState } from "../../../../lib";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { CommitBox } from "./CommitBox";
import { ConflictedFiles } from "./ConflictedFiles";
import { DeletedFiles } from "./DeletedFiles";
import { Difference } from "./Difference";
import { ModifiedChanges } from "./ModifiedChanges";
import { StagedChanges } from "./StagedChanges";
import { UntrackedFiles } from "./UntrackedFiles";

interface IChangesProps{
    height:number;
}

interface IState {
    adjustedX: number;
    status?:IStatus;
    selectedFilePath?:string;
    differenceRefreshKey:number;
    selectedFileModel:EnumChangesType;
    expandedTabCount:number;
    commitBoxHeight:number;
    minHeightOfEachTab:number;
    // document:Descendant[],
}

function ChangesComponent(props:IChangesProps) {
    const [state, setState] = useMultiState<IState>({
        adjustedX: 0,
        differenceRefreshKey: Date.now(),
        selectedFileModel:EnumChangesType.MODIFIED,
        expandedTabCount:0,
        commitBoxHeight:113,
        minHeightOfEachTab:20,
    });

    const store = useSelectorTyped(state=>({
        focusVersion:state.ui.versions.appFocused,
        recentRepositories:state.savedData.recentRepositories,
        show:state.ui.selectedRepoTab === EnumSelectedRepoTab.CHANGES,
        status:state.ui.status,
    }),shallowEqual);

    const dragData = useRef({ initialX: 0, currentX: 0 });
    const repoInfo = useMemo(()=>{
        return store.recentRepositories.find(x=>x.isSelected);
    },[store.recentRepositories])

    const getStatus=()=>{
        if(repoInfo) window.ipcRenderer.send(RendererEvents.getStatus().channel,repoInfo);
    }

    useEffect(()=>{
         getStatus();
         setState({selectedFilePath:null!});
    },[repoInfo?.path]);

    useEffect(()=>{
        getStatus();
        setState({differenceRefreshKey:Date.now()})
    },[store.focusVersion])

    useEffect(()=>{
        setState({status:store.status});
    },[store.status])

    useEffect(()=>{
        if(!state.selectedFilePath) return;
        if(state.selectedFileModel === EnumChangesType.CONFLICTED &&  state.status?.conflicted?.some(x=> x.path === state.selectedFilePath)) return;
        if(state.selectedFileModel === EnumChangesType.CREATED &&  state.status?.not_added?.some(x=> x.path === state.selectedFilePath)) return;
        if(state.selectedFileModel === EnumChangesType.DELETED &&  state.status?.deleted?.some(x=> x.path === state.selectedFilePath)) return;
        if(state.selectedFileModel === EnumChangesType.MODIFIED &&  state.status?.modified?.some(x=> x.path === state.selectedFilePath)) return;
        if(state.selectedFileModel === EnumChangesType.STAGED &&  state.status?.staged?.some(x=> x.path === state.selectedFilePath)) return;

        setState({selectedFilePath:null!});
    },[state.status])

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.getStatus().replyChannel,(e,result:IStatus)=>{
            setState({status:result});            
            ReduxUtils.setStatusCurrent(result);
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

    const handleSelect = useCallback((path:string,mode:EnumChangesType)=>{
        setState({selectedFilePath:path,selectedFileModel:mode});
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

    const handleExpand=(isExpanded:boolean,fileCount?:number)=>{
        if(!fileCount) return;
        console.log("isExpanded",isExpanded);
        const adjustment = isExpanded ?1:-1;
        setState({expandedTabCount:state.expandedTabCount+adjustment});
    }

    const tabHeight = useMemo(()=>{
        if(!state.expandedTabCount)
            return state.minHeightOfEachTab;
        const minHeightByTabs = (5-state.expandedTabCount)* state.minHeightOfEachTab;
        return ((props.height - state.commitBoxHeight-minHeightByTabs)/state.expandedTabCount);
    },[state.expandedTabCount,state.commitBoxHeight])
    console.log("tabHeight",tabHeight);
      
    console.log("state.status",state);

    // if(!props.repoInfo) return null;

    return <div className={`d-flex w-100 h-100 ${store.show?'':'d-none'}`}>

        <div className="" style={{ width: `calc(20% ${getAdjustedSize(state.adjustedX)})` }}>
            
            <CommitBox onHeightChange={height=> {console.log("height changed."); setState({commitBoxHeight:height})}} />
            {!!state.commitBoxHeight && <Fragment>
    
            <StagedChanges stagedChanges={state.status?.staged} onStatusChange={onStatusChange} repoInfoInfo={repoInfo}
                handleSelect={path=> handleSelect(path,EnumChangesType.STAGED)} selectedFilePath={state.selectedFilePath} selectedMode={state.selectedFileModel} />
    
            <ConflictedFiles onFileSelect={(path)=>handleSelect(path,EnumChangesType.CONFLICTED)} files={state.status?.conflicted} 
            onStatusChange={onStatusChange} repoInfoInfo={repoInfo} handleExpand={(isExpanded)=>handleExpand(isExpanded,state.status?.conflicted?.length)} />
        
            <ModifiedChanges modifiedChanges={state.status?.not_added} repoInfoInfo={repoInfo} 
                onStatusChange={onStatusChange} onFileSelect={(path)=> handleSelect(path, EnumChangesType.MODIFIED)} selectedFilePath={state.selectedFilePath}
                selectedMode={state.selectedFileModel}
                handleExpand={(isExpanded)=>handleExpand(isExpanded,state.status?.not_added?.length)} 
                height = {tabHeight}
                handleMinHeightChange={(height)=> setState({minHeightOfEachTab:height})} />
            
        
            <UntrackedFiles onFileSelect={(path)=>handleSelect(path,EnumChangesType.CREATED)} files={state.status?.created} 
            onStatusChange={onStatusChange} repoInfoInfo={repoInfo}
            handleExpand={(isExpanded)=>handleExpand(isExpanded,state.status?.created?.length)} 
            height = {tabHeight} />        
        
            <DeletedFiles onFileSelect={(path)=>handleSelect(path,EnumChangesType.DELETED)} files={state.status?.deleted} 
            onStatusChange={onStatusChange} repoInfoInfo={repoInfo}
            handleExpand={handleExpand} height={tabHeight} />
        

        </Fragment>
        }
        </div>
        <div className="bg-info cur-resize" onMouseDown={handleMoseDown} style={{ width: '3px',zIndex:2 }} />

        <div className="ps-2 bg-white" style={{ width: `calc(80% - 3px ${getAdjustedSize(-state.adjustedX)})`,zIndex:2 }}>
            {!!state.selectedFilePath && !!repoInfo && <Difference refreshV={state.differenceRefreshKey} path={state.selectedFilePath} repoInfo={repoInfo} mode={state.selectedFileModel} />}
            {/* <Editor document={state.document} onChange={onChange} /> */}
        </div>
    </div>
}

export const Changes = React.memo(ChangesComponent);