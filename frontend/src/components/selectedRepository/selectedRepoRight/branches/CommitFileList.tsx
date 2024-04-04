import { IFile, StringUtils } from "common_library";
import React from "react"

interface IProps{
    files:IFile[];
}

function CommitFileListComponent(props:IProps){
    return <div style={{width:300}} className="overflow-hidden">
        {
            props.files.map(f=>(
                <div title={f.path} key={f.path} className="cur-default">
                    <span>{f.fileName}</span> 
                    <span className="ps-2 text-success fw-bold cur-default" title={StringUtils.getStatusText(f.changeType)}>{StringUtils.getChangeTypeHint(f.changeType)}</span>
                </div>
            ))
        }
    </div>
}

export const CommitFileList = React.memo(CommitFileListComponent);