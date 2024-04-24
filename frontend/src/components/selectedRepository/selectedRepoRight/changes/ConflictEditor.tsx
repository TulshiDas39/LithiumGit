import React, { useEffect, useMemo, useRef } from "react"
import { useSelectorTyped } from "../../../../store/rootReducer"
import { shallowEqual, useDispatch } from "react-redux"
import { ConflictUtils, EnumHtmlIds, RepoUtils, useDrag } from "../../../../lib"
import { RendererEvents } from "common_library"
import { IpcUtils } from "../../../../lib/utils/IpcUtils"
import { ActionChanges, ActionConflict } from "../../../../store"

function ConflictEditorComponent(){
    const store = useSelectorTyped(state=>({
        selectedFile:state.changes.selectedFile,
        currentStep:state.changes.currentStep,
        totalStep:state.changes.totalStep,        
    }),shallowEqual);
    const dispatch = useDispatch();

    const hightDisplacementRef = useRef(0);
    const positionRef = useRef(0);
    const {currentMousePosition:position,elementRef:resizer} = useDrag();

    const hightDisplacement = useMemo(()=>{
        if(!position){
            hightDisplacementRef.current -= positionRef.current;
            positionRef.current = 0;
            return hightDisplacementRef.current;
        }
        positionRef.current = position.y;
        return hightDisplacementRef.current - positionRef.current;
    },[position?.y])

    useEffect(()=>{
        if(!store.selectedFile)
            return ;
        // ChangeUtils.containerId = EnumHtmlIds.diffview_container;
        const joinedPath = window.ipcRenderer.sendSync(RendererEvents.joinPath().channel, RepoUtils.repositoryDetails.repoInfo.path,store.selectedFile.path);
        IpcUtils.getFileContent(joinedPath).then(res=>{
            //const lines = StringUtils.getLines(res.result!);
            const lineConfig = ConflictUtils.GetUiLinesOfConflict(res);
            ConflictUtils.incomingLines = lineConfig.previousLines;
            ConflictUtils.currentLines = lineConfig.currentLines;
            ConflictUtils.ShowEditor();                                    
            ConflictUtils.FocusHightlightedLine(1);
            dispatch(ActionChanges.updateData({totalStep:ConflictUtils.totalChangeCount,currentStep:1}));
        })
    },[store.selectedFile])

    const handleNext=()=>{
        if(store.currentStep >= store.totalStep)
            return;
        dispatch(ActionConflict.updateData({currentStep:store.currentStep+1}));
    }

    const handlePrevious=()=>{
        if(store.currentStep <= 1)
            return;
        dispatch(ActionConflict.updateData({currentStep:store.currentStep-1}));
    }

    const getSign=(value:number)=>{
        if(value < 0)
            return "-";
        return "+";
    }

    if(!store.selectedFile)
        return null;
    return <div id="conflict-editor"  className="h-100 w-100">
        <div style={{height:30}} className="d-flex align-items-center w-100 border-bottom">
            <div className={"w-50 d-flex align-items-center"}>
                <div className="check_all_incoming d-flex justify-content-end">
                    <input id={EnumHtmlIds.accept_all_incoming} type="checkbox" title="Accept all incoming changes" />
                </div>
                <div className="ps-2">Incoming changes</div>
            </div>
            <div className="w-50 d-flex align-items-center">
                <div className="check_all_current d-flex justify-content-end">
                    <input id={EnumHtmlIds.accept_all_current} type="checkbox" title="Accept all current changes" />
                </div>                
                <div className="ps-2">Current changes</div>
            </div>
        </div>
        <div style={{height:'calc(100% - 33px)'}}>
            <div className="w-100" id={EnumHtmlIds.ConflictEditorTopPanel} style={{height:`calc(50% ${getSign(-(hightDisplacement+3))}  ${Math.abs(hightDisplacement+3)}px)`}}>            
            </div>
            <div ref={resizer as any} className="w-100 bg-second-color cur-resize-v" style={{height:3}}/>
            <div className="w-100" id={EnumHtmlIds.ConflictEditorBottomPanel} style={{height:`calc(50% ${getSign(hightDisplacement)} ${Math.abs(hightDisplacement)}px)`}}>            
            </div>
        </div>
    </div>
}

export const ConflictEditor = React.memo(ConflictEditorComponent)