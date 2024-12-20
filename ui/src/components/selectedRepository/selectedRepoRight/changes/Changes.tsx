import { EnumChangeType } from "common_library";
import React, { useMemo, useRef } from "react"
import { useEffect } from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { EnumChangeGroup, EnumHtmlIds, EnumSelectedRepoTab, useMultiState } from "../../../../lib";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { CommitBox } from "./CommitBox";
import { ChangesTabPane } from "./ChangesTabPane";
import { ConflictEditor } from "./ConflictEditor";
import { ActionChanges } from "../../../../store";
import { ChangesData } from "../../../../lib/data/ChangesData";
import { RebaseActionBox } from "./RebaseActionBox";
import { CherryPickActionBox } from "./CherryPickActionBox";


interface IState {
    adjustedX: number;    
    differenceRefreshKey:number;
}

function ChangesComponent() {
    const [state, setState] = useMultiState<IState>({
        adjustedX: 0,
        differenceRefreshKey: Date.now(),
    });

    const store = useSelectorTyped(state=>({        
        focusVersion:state.ui.versions.appFocused,
        repoInfo:state.savedData.recentRepositories.find(_ => _.isSelected),
        show:state.ui.selectedRepoTab === EnumSelectedRepoTab.CHANGES,
        status:state.ui.status,
        selectedFile:state.changes.selectedFile,
    }),shallowEqual);

    const dispatch = useDispatch();
    const changeUtils = ChangesData.changeUtils;

    const dragData = useRef({ initialX: 0, currentX: 0 });

    useEffect(()=>{
         dispatch(ActionChanges.updateData({selectedFile:undefined,currentStep:0,totalStep:0}));
    },[store.repoInfo?.path]);

    useEffect(()=>{
        setState({differenceRefreshKey:Date.now()})
    },[store.focusVersion])

    const checkForDiifClear=()=>{
        const file = changeUtils.file!;
        if(!!file && !store.selectedFile)
            changeUtils.ClearView();        
    }

    useEffect(()=>{
        if(!store.selectedFile || !store.status) return;
        const changedFiles = [...store.status.conflicted,...store.status.staged,...store.status.unstaged];
        const existInStatus = changedFiles.some(x=> x.path === store.selectedFile?.path 
            && x.changeType === store.selectedFile.changeType 
            && x.changeGroup === store.selectedFile.changeGroup);
        if(!existInStatus)
            dispatch(ActionChanges.updateData({selectedFile:undefined}));        
    },[store.status,store.selectedFile])

    useEffect(()=>{
        checkForDiifClear();
    },[store.selectedFile])

    const getAdjustedSize = (adjustedX: number) => {
        if (adjustedX > 0) return `+ ${adjustedX}px`;
        return `- ${-adjustedX}px`;
    }

    const handleMoseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        e.preventDefault();
        if(!dragData.current.initialX) dragData.current.initialX = e.pageX;
        function resize(e: MouseEvent) {
            const deltaX = e.pageX - dragData.current.initialX;
            if(deltaX < -100 || deltaX > 500)
                return;
            dragData.current.currentX = e.pageX;
            setState({adjustedX:deltaX});        
        }
        function stopResize() {
            window.removeEventListener('mousemove', resize);
        }
        window.addEventListener('mousemove', resize);        
        window.addEventListener('mouseup', stopResize);

    }
    
    useEffect(()=>{        
        return ()=>{
            dispatch(ActionChanges.updateData({currentStep:0}));
        }
    },[])

    const getActionBox=()=>{
        if(store.status?.rebasingCommit)
            return <RebaseActionBox />;
        if(store.status?.cherryPickingCommit)
            return <CherryPickActionBox />;

        return <CommitBox />;
    }

    return <div className={`d-flex w-100 h-100 ${store.show?'':'d-none'}`}>

        <div className="d-flex flex-column" style={{ width: `calc(20% ${getAdjustedSize(state.adjustedX)})` }}>
            {getActionBox()}
            <ChangesTabPane  />
        </div>
        <div className="bg-info cur-resize" onMouseDown={handleMoseDown} style={{ width: '3px' }} />

        <div className="ps-2" style={{ width: `calc(80% - 3px ${getAdjustedSize(-state.adjustedX)})` }}>            

            {store.selectedFile?.changeType !== EnumChangeType.CONFLICTED && <div id={EnumHtmlIds.diffview_container} className="h-100">

            </div>}
            {store.selectedFile?.changeType === EnumChangeType.CONFLICTED &&
                <ConflictEditor />
            }
        </div>
    </div>
}

export const Changes = React.memo(ChangesComponent);