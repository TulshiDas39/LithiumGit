import { EnumChangeType, IFile, IStatus, RendererEvents } from "common_library";
import React, { Fragment, useMemo, useRef } from "react"
import { useCallback } from "react";
import { useEffect } from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { EnumChangeGroup, EnumSelectedRepoTab, UiUtils, useMultiState } from "../../../../lib";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { CommitBox } from "./CommitBox";
import { ConflictedFiles } from "./ConflictedFiles";
import { Difference } from "./Difference";
import { ModifiedChanges } from "./ModifiedChanges";
import { StagedChanges } from "./StagedChanges";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { ActionUI } from "../../../../store/slices/UiSlice";

interface IChangesProps{
    height:number;
}

interface IState {
    adjustedX: number;
    selectedFilePath?:string;
    differenceRefreshKey:number;
    selectedFileGroup:EnumChangeGroup;
    selectedFileChangeType:EnumChangeType;
    // expandedTabCount:number;
    expandedTabs:EnumChangeGroup[];
    commitBoxHeight:number;
    minHeightOfEachTab:number;
    // document:Descendant[],
}

function ChangesComponent(props:IChangesProps) {
    const [state, setState] = useMultiState<IState>({
        adjustedX: 0,
        differenceRefreshKey: Date.now(),
        selectedFileGroup:EnumChangeGroup.UN_STAGED,
        selectedFileChangeType:EnumChangeType.MODIFIED,
        // expandedTabCount:0,
        commitBoxHeight:113,
        minHeightOfEachTab:20,
        expandedTabs:[],
    });

    const store = useSelectorTyped(state=>({        
        focusVersion:state.ui.versions.appFocused,
        recentRepositories:state.savedData.recentRepositories,
        show:state.ui.selectedRepoTab === EnumSelectedRepoTab.CHANGES,
        status:state.ui.status,
    }),shallowEqual);

    const dispatch = useDispatch()

    const dragData = useRef({ initialX: 0, currentX: 0 });
    const repoInfo = useMemo(()=>{
        return store.recentRepositories.find(x=>x.isSelected);
    },[store.recentRepositories])

    useEffect(()=>{
         setState({selectedFilePath:null!});
    },[repoInfo?.path]);

    useEffect(()=>{
        setState({differenceRefreshKey:Date.now()})
    },[store.focusVersion])

    useEffect(()=>{
        if(!state.selectedFilePath) return;
        if(state.selectedFileGroup === EnumChangeGroup.CONFLICTED &&  store.status?.conflicted?.some(x=> x.path === state.selectedFilePath)) return;
        if(state.selectedFileGroup === EnumChangeGroup.UN_STAGED &&  store.status?.unstaged?.some(x=> x.path === state.selectedFilePath)) return;
        if(state.selectedFileGroup === EnumChangeGroup.STAGED &&  store.status?.staged?.some(x=> x.path === state.selectedFilePath)) return;

        setState({selectedFilePath:null!});
    },[store.status])

    const getAdjustedSize = (adjustedX: number) => {
        if (adjustedX > 0) return `+ ${adjustedX}px`;
        return `- ${-adjustedX}px`;
    }

    const handleSelect = useCallback((changedFile:IFile,changeGroup:EnumChangeGroup)=>{
        setState({selectedFilePath:changedFile.path,selectedFileGroup:changeGroup,selectedFileChangeType:changedFile.changeType});
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

    const handleExpand=(tab:EnumChangeGroup)=>{
        //if(!fileCount) return;
        //const adjustment = state.expandedTabss.has(tab) ?1:-1;
        const expandedTabs = state.expandedTabs.includes(tab)? state.expandedTabs.filter(x=> x!= tab)
        :[...state.expandedTabs,tab]
        setState({expandedTabs:expandedTabs});
    }

    const expandedTabCountHavingFile = useMemo(()=>{
        let count = 0;
        if(state.expandedTabs.includes(EnumChangeGroup.CONFLICTED)){
            if(store.status?.conflicted.length)
                count++;
        }
        if(state.expandedTabs.includes(EnumChangeGroup.UN_STAGED)){
            if(store.status?.unstaged.length)
                count++;
        }
        if(state.expandedTabs.includes(EnumChangeGroup.STAGED)){
            if(store.status?.staged.length)
                count++;
        }
        return count;
    },[state.expandedTabs,store.status])

    const tabHeight = useMemo(()=>{
        if(!expandedTabCountHavingFile)
            return state.minHeightOfEachTab;
        const minHeightByTabs = (3 - expandedTabCountHavingFile)* state.minHeightOfEachTab;
        return ((props.height - state.commitBoxHeight-minHeightByTabs)/expandedTabCountHavingFile);
    },[state.commitBoxHeight,state.minHeightOfEachTab,expandedTabCountHavingFile])
      

    if(!store.status)
        return <div></div>
    return <div className={`d-flex w-100 h-100 ${store.show?'':'d-none'}`}>

        <div className="" style={{ width: `calc(20% ${getAdjustedSize(state.adjustedX)})` }}>
            
            <CommitBox onHeightChange={height=> {setState({commitBoxHeight:height})}} />
            {!!state.commitBoxHeight && <Fragment>
    
            {!!store.status?.staged.length && <StagedChanges changes={store.status.staged} repoInfoInfo={repoInfo}
                handleSelect={file=> handleSelect(file, EnumChangeGroup.STAGED)} selectedFilePath={state.selectedFilePath} selectedMode={state.selectedFileGroup}
                isExpanded={state.expandedTabs.includes(EnumChangeGroup.STAGED)} 
                hanldeExpand={()=> handleExpand(EnumChangeGroup.STAGED)}
                height = {tabHeight}/>}
    
           {!!store.status?.conflicted?.length && <ConflictedFiles onFileSelect={(file)=>handleSelect(file,EnumChangeGroup.CONFLICTED)} files={store.status?.conflicted}
            repoInfoInfo={repoInfo} handleExpand={()=>handleExpand(EnumChangeGroup.CONFLICTED)}
            isExpanded={state.expandedTabs.includes(EnumChangeGroup.CONFLICTED)} />}
        
            <ModifiedChanges changes={store.status!.unstaged} repoInfoInfo={repoInfo} 
                onFileSelect={(path)=> handleSelect(path, EnumChangeGroup.UN_STAGED)} selectedFilePath={state.selectedFilePath}
                selectedMode={state.selectedFileGroup}
                handleExpand={()=>handleExpand(EnumChangeGroup.UN_STAGED)} 
                height = {tabHeight}/>
        
        </Fragment>
        }
        </div>
        <div className="bg-info cur-resize" onMouseDown={handleMoseDown} style={{ width: '3px',zIndex:2 }} />

        <div className="ps-2 bg-white" style={{ width: `calc(80% - 3px ${getAdjustedSize(-state.adjustedX)})`,zIndex:2 }}>
            {!!state.selectedFilePath && !!repoInfo && <Difference refreshV={state.differenceRefreshKey} 
                path={state.selectedFilePath} repoInfo={repoInfo} 
                changeGroup={state.selectedFileGroup} 
                changeType={state.selectedFileChangeType}/>}
            {/* <Editor document={state.document} onChange={onChange} /> */}
        </div>
    </div>
}

export const Changes = React.memo(ChangesComponent);