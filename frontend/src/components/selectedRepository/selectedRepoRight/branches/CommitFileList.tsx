import { EnumChangeType, IFile, StringUtils } from "common_library";
import React from "react"

interface IProps{
    files:IFile[];
    width:number;
    onFileSelect:(file:IFile)=>void;
    selectedFile?:IFile;
}

function CommitFileListComponent(props:IProps){
    return <div style={{width:props.width}} className="h-100 overflow-auto">
        {
            props.files.map(f=>(
                <div title={f.path} key={f.path} className={`cur-default hover ${props.selectedFile?.path === f.path?'selected':''}`} onClick={_=> props.onFileSelect(f)}>
                    <span className= {`${f.changeType === EnumChangeType.DELETED?"text-decoration-line-through":""}`}>{f.fileName}</span> 
                    <span className="ps-2 text-success fw-bold cur-default" title={StringUtils.getStatusText(f.changeType)}>{StringUtils.getChangeTypeHint(f.changeType)}</span>
                </div>
            ))
        }
    </div>
}

export const CommitFileList = React.memo(CommitFileListComponent);