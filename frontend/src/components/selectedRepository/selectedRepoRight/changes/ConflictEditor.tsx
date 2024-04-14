import React, { useEffect } from "react"
import { useSelectorTyped } from "../../../../store/rootReducer"
import { shallowEqual } from "react-redux"
import { ConflictUtils, EnumHtmlIds, RepoUtils } from "../../../../lib"
import { RendererEvents } from "common_library"
import { IpcUtils } from "../../../../lib/utils/IpcUtils"

function ConflictEditorComponent(){
    const store = useSelectorTyped((state)=>({
        selectedFile:state.ui.selectedFile,
    }),shallowEqual);

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

    return <div  className="h-100 w-100">
        <div className="h-50 w-100" id={EnumHtmlIds.ConflictEditorTopPanel}>            
        </div>
        <div className="h-50 w-100" id={EnumHtmlIds.ConflictEditorBottomPanel}>            
        </div>
    </div>
}

export const ConflictEditor = React.memo(ConflictEditorComponent)