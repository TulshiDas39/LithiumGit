import React, { useEffect, useMemo, useRef } from "react"
import { useSelectorTyped } from "../../../../store/rootReducer"
import { shallowEqual, useDispatch } from "react-redux"
import { ChangesData, EnumHtmlIds, RepoUtils, useDrag, useMultiState } from "../../../../lib"
import { RendererEvents } from "common_library"
import { IpcUtils } from "../../../../lib/utils/IpcUtils"
import { ActionModals } from "../../../../store"
import { ModalData } from "../../../modals/ModalData"
import { ConflictResolutionEditor } from "../../../../lib/utils/editors"

interface IState{
    lastUpdated:string;
}

function ConflictEditorComponent(){
    const store = useSelectorTyped(state=>({
        selectedFile:state.changes.selectedFile,
        currentStep:state.changes.currentStep,
        totalStep:state.changes.totalStep,
        appFocusVersion:state.ui.versions.appFocused,
    }),shallowEqual);

    const [state,setState] = useMultiState<IState>({lastUpdated:""});
    const dispatch = useDispatch();

    const refData = useRef({isMounted:false,lastUpdated:""});
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

    const clearEditor = ()=>{
        if(ChangesData.conflictEditor){
            ChangesData.conflictEditor.destroy();
            ChangesData.conflictEditor = undefined!;
        }
    }

    useEffect(()=>{
        if(!store.selectedFile){
            clearEditor();
            return ;
        }                    
        const editor = new ConflictResolutionEditor(`#${EnumHtmlIds.ConflictEditorBottomPanel}`);
        ChangesData.conflictEditor = editor;
        editor.renderFile(store.selectedFile).then(success=>{            
            if(!success){
                ModalData.appToast.message = "There was an error reading the content.";
                dispatch(ActionModals.showToast());
            }
        });
        return ()=>{
            clearEditor();
        }
    },[store.selectedFile])

    useEffect(()=>{
        if(!refData.current.isMounted)
            return;
        ChangesData.conflictEditor?.checkForFileUpdate();
    },[state.lastUpdated])

    useEffect(()=>{
        const path = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path, store.selectedFile!.path);
        IpcUtils.getLastUpdatedDate(path).then(date=>{            
            refData.current.lastUpdated = date;
        })
    },[store.selectedFile])
    
    useEffect(()=>{
        if(!store.selectedFile || !refData.current.isMounted)
            return;
        const path = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path, store.selectedFile!.path);
        IpcUtils.getLastUpdatedDate(path).then(date=>{
            if(!!refData.current.lastUpdated && refData.current.lastUpdated !== date){
                refData.current.lastUpdated = date;
                setState({lastUpdated:date});
            }
            else{
                refData.current.lastUpdated = date;
            }

        })
    },[store.appFocusVersion])

    const getSign=(value:number)=>{
        if(value < 0)
            return "-";
        return "+";
    }

    useEffect(()=>{
        refData.current.isMounted = true;
        return ()=>{
            clearEditor();
            refData.current.isMounted = false;
        }
    },[])

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
                <div className="w-100" id={EnumHtmlIds.ConflictEditorBottomPanel} style={{height:`calc(50% ${getSign(hightDisplacement)} ${Math.abs(hightDisplacement)}px)`}}>
                    <div className="h-100 w-100 d-flex conflict-resolution">
                        <div className="noselect line_numbers overflow-y-hidden h-100"></div>
                        <div className="h-100 content-container overflow-auto flex-grow-1">
                            <div className="ps-1 content fit-content min-w-100"></div>
                        </div>
                    </div>
                </div>            
            </div>
        </div>
    </div>
}

export const ConflictEditor = React.memo(ConflictEditorComponent)