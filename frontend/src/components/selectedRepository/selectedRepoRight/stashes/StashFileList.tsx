import { EnumChangeType, IFile, StringUtils } from "common_library";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import { UiUtils } from "../../../../lib";
import React from "react";

interface IProps{
    files?:IFile[];
    width:number;
    onFileSelect:(file:IFile)=>void;
    selectedFile?:IFile;
}

function StashFileListComponent(props:IProps){
    return <div style={{width:props.width}} className="h-100">
    <div style={{height:30}} className="ps-1">
        <b>Changed Files</b>
    </div>
    <div className="overflow-auto ps-1" style={{height:`calc(100% - 30px)`}}>
        {
            props.files?.map(f=>(
                <div title={f.path} key={f.path} className={`row g-0 align-items-center flex-nowrap hover w-100 cur-default ${props.selectedFile?.path === f.path?'selected':''}`} onClick={_=> props.onFileSelect(f)}>
                    <div className={`col-auto overflow-hidden align-items-center flex-shrink-1`} style={{textOverflow:'ellipsis'}}>
                        <span className= {`${f.changeType === EnumChangeType.DELETED?"text-decoration-line-through":""}`}>{f.fileName}</span> 
                        <span className="ps-2 text-secondary small" style={{whiteSpace: 'nowrap'}}>
                            <span className="px-1">
                                 <FaPlusCircle className="text-success small"/>
                                 <span className="ps-1">{f.addCount || 0}</span>
                            </span>
                            <span className="px-1">
                                <FaMinusCircle className="text-danger small"/>
                                <span className="ps-1">{f.deleteCount || 0}</span>
                            </span>
                            {/* <span className="ps-1">{f.path}</span> */}
                        </span>
                    </div>
                    <div className="col-auto align-items-center flex-nowrap overflow-hidden flex-grow-1 text-end">
                        {/* <span className={`px-2 fw-bold cur-default ${UiUtils.getChangeTypeHintColor(f.changeType)}`} title={StringUtils.getStatusText(f.changeType)}>{StringUtils.getChangeTypeHint(f.changeType)}</span> */}
                    </div>                        
                </div>
            ))
        }
    </div>        
</div>
}

export const StashFileList = React.memo(StashFileListComponent)