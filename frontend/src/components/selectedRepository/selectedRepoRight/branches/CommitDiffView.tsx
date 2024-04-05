import React, { useEffect } from "react"
import { BranchGraphUtils, DiffUtils, EnumHtmlIds } from "../../../../lib";
import { ChangeUtils } from "../../../../lib/utils/ChangeUtils";
import { EnumChangeType, IFile, StringUtils } from "common_library";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";

interface IProps{
    file?:IFile
}

function CommitDiffViewComponent(props:IProps){

    useEffect(()=>{
        console.log("file changed");
        const selectedCommit = BranchGraphUtils.state.selectedCommit;
        if(!props.file || !selectedCommit.value){
            ChangeUtils.ClearView();
            return;
        }
        IpcUtils.getFileContentAtSpecificCommit(selectedCommit.value.hash, props.file.path).then(res=>{
            const content = res.response || "";
            console.log("content",content);
            const lines = StringUtils.getLines(content);
            if(props.file?.changeType === EnumChangeType.MODIFIED){
                const options =  [selectedCommit.value.hash,"--word-diff=porcelain", "--word-diff-regex=.","--diff-algorithm=minimal",props.file.path];            
                IpcUtils.getDiff(options).then(res=>{
                    let lineConfigs = DiffUtils.GetUiLines(res,lines);
                    console.log("lineconfig",lineConfigs);
                    ChangeUtils.currentLines = lineConfigs.currentLines;
                    ChangeUtils.previousLines = lineConfigs.previousLines;
                    ChangeUtils.showChanges();
                })
            }
        })
    },[props.file])
    
    useEffect(()=>{
        ChangeUtils.containerId = EnumHtmlIds.CommitDiff;        
    },[])
    return <div id={EnumHtmlIds.CommitDiff} className="h-100 w-100">

    </div>
}

export const CommitDiffView = React.memo(CommitDiffViewComponent);