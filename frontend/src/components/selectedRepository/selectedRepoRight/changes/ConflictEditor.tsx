import React, { useEffect } from "react"
import { useSelectorTyped } from "../../../../store/rootReducer"
import { shallowEqual, useDispatch } from "react-redux"
import { ConflictUtils, EnumHtmlIds, RepoUtils } from "../../../../lib"
import { RendererEvents } from "common_library"
import { IpcUtils } from "../../../../lib/utils/IpcUtils"
import { StepNavigation } from "../../../common"
import { ActionConflict } from "../../../../store"

function ConflictEditorComponent(){
    const store = useSelectorTyped(state=>state.conflict,shallowEqual);
    const dispatch = useDispatch();

    useEffect(()=>{
        if(!store.selectedFile)
            return ;
        // ChangeUtils.containerId = EnumHtmlIds.diffview_container;
        const joinedPath = window.ipcRenderer.sendSync(RendererEvents.joinPath().channel, RepoUtils.repositoryDetails.repoInfo.path,store.selectedFile.path);
        IpcUtils.getFileContent(joinedPath).then(res=>{
            //const lines = StringUtils.getLines(res.result!);
            const lineConfig = ConflictUtils.GetUiLinesOfConflict(res);
            ConflictUtils.previousLines = lineConfig.previousLines;
            ConflictUtils.currentLines = lineConfig.currentLines;
            ConflictUtils.ShowEditor();
            console.log("content");
            console.log(lineConfig);
            //ConflictUtils
            // const options =  ["--staged","--word-diff=porcelain", "--word-diff-regex=.","--diff-algorithm=minimal",store.selectedFile!.path];                    
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

    if(!store.selectedFile)
        return null;
    return <div id="conflict-editor"  className="h-100 w-100">
        <div style={{height:30}} className="d-flex align-items-center w-100 border-bottom">
            <div className={"overflow-ellipsis w-25"} title={store.selectedFile.path}>
                {store.selectedFile?.fileName}
            </div>
            <div className="w-75 text-end">
                <StepNavigation currentStep={store.currentStep} totalStep={store.totalStep}
                onNextClick={handleNext} onPreviousClick={handlePrevious}/>
            </div>
        </div>
        <div style={{height:'calc(100% - 30px)'}}>
            <div className="h-50 w-100" id={EnumHtmlIds.ConflictEditorTopPanel}>            
            </div>
            <div className="h-50 w-100" id={EnumHtmlIds.ConflictEditorBottomPanel}>            
            </div>
        </div>
    </div>
}

export const ConflictEditor = React.memo(ConflictEditorComponent)