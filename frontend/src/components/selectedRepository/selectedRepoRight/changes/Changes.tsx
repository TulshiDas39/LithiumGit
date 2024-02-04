import { EnumChangeType, IFile } from "common_library";
import React, { useMemo, useRef } from "react"
import { useCallback } from "react";
import { useEffect } from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { EnumChangeGroup, EnumHtmlIds, EnumSelectedRepoTab, useMultiState } from "../../../../lib";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { CommitBox } from "./CommitBox";
import { Difference } from "./Difference";
import { ChangesTabPane } from "./ChangesTabPane";
import { Difference2 } from "./Difference2";
import { ChangeUtils } from "../../../../lib/utils/ChangeUtils";

interface IChangesProps{
    //height:number;
}

interface IState {
    adjustedX: number;
    selectedFile?:IFile;
    differenceRefreshKey:number;
    selectedFileGroup:EnumChangeGroup;    
    // expandedTabCount:number;
    // document:Descendant[],
}

function ChangesComponent() {
    const [state, setState] = useMultiState<IState>({
        adjustedX: 0,
        differenceRefreshKey: Date.now(),
        selectedFileGroup:EnumChangeGroup.UN_STAGED,
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
         setState({selectedFile:null!});
    },[repoInfo?.path]);

    useEffect(()=>{
        setState({differenceRefreshKey:Date.now()})
    },[store.focusVersion])

    useEffect(()=>{
        if(!state.selectedFile) return;
        if(state.selectedFileGroup === EnumChangeGroup.CONFLICTED &&  store.status?.conflicted?.some(x=> x.path === state.selectedFile?.path)) return;
        if(state.selectedFileGroup === EnumChangeGroup.UN_STAGED &&  store.status?.unstaged?.some(x=> x.path === state.selectedFile?.path)) return;
        if(state.selectedFileGroup === EnumChangeGroup.STAGED &&  store.status?.staged?.some(x=> x.path === state.selectedFile?.path)) return;

        setState({selectedFile:null!});
    },[store.status])

    const getAdjustedSize = (adjustedX: number) => {
        if (adjustedX > 0) return `+ ${adjustedX}px`;
        return `- ${-adjustedX}px`;
    }

    const handleSelect = useCallback((changedFile:IFile,changeGroup:EnumChangeGroup)=>{
        setState({selectedFile:changedFile,selectedFileGroup:changeGroup});
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
    
    useEffect(()=>{
        ChangeUtils.containerId = EnumHtmlIds.diffview_container;
    },[])

    return <div className={`d-flex w-100 h-100 ${store.show?'':'d-none'}`}>

        <div className="d-flex flex-column" style={{ width: `calc(20% ${getAdjustedSize(state.adjustedX)})` }}>
            <CommitBox />
            <ChangesTabPane handleSelectFile={handleSelect} selectedFile={state.selectedFile} group={state.selectedFileGroup}  />
        </div>
        <div className="bg-info cur-resize" onMouseDown={handleMoseDown} style={{ width: '3px',zIndex:2 }} />

        <div className="ps-2 bg-white" style={{ width: `calc(80% - 3px ${getAdjustedSize(-state.adjustedX)})`,zIndex:2 }}>
            {/* {!!state.selectedFile && !!repoInfo && <Difference refreshV={state.differenceRefreshKey} 
                path={state.selectedFile.path} repoInfo={repoInfo} 
                changeGroup={state.selectedFileGroup} 
                changeType={state.selectedFile.changeType}/>} */}

            <div id={EnumHtmlIds.diffview_container}>

            </div>
        </div>
    </div>
}

export const Changes = React.memo(ChangesComponent);