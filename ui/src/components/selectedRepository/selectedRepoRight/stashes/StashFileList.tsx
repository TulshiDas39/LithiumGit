import { EnumChangeListViewMode, EnumChangeType, IFile, StringUtils } from "common_library";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import { MdInsertDriveFile } from "react-icons/md";
import { UiUtils } from "../../../../lib";
import React from "react";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { ChangeListViewModeMenu, FileTreeRows } from "../../../common";

interface IProps{
    files?:IFile[];
    width:number;
    onFileSelect:(file:IFile)=>void;
    selectedFile?:IFile;
}

interface IFileRowProps{
    file:IFile;
    depth:number;
    showPath:boolean;
    onFileSelect:(file:IFile)=>void;
    selectedFile?:IFile;
}

function FileRow(props:IFileRowProps){
    const f = props.file;
    return <div title={f.path} className={`row g-0 align-items-center flex-nowrap hover w-100 cur-default ${props.selectedFile?.path === f.path?'selected':''}`}
        style={{paddingLeft:props.depth*16+20}} onClick={_=> props.onFileSelect(f)}>
        <div className={`col-auto d-flex align-items-center flex-nowrap overflow-hidden flex-shrink-1`} style={{textOverflow:'ellipsis'}}>
            <MdInsertDriveFile className="text-secondary pe-1" style={{flexShrink:0, fontSize:'1.2em'}} />
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
                {props.showPath && <span className="ps-1">{f.path}</span>}
            </span>
        </div>
        <div className="col-auto align-items-center flex-nowrap overflow-hidden flex-grow-1 text-end">
            <span className={`px-2 fw-bold cur-default ${UiUtils.getChangeTypeHintColor(f.changeType)}`} title={StringUtils.getStatusText(f.changeType)}>{StringUtils.getChangeTypeHint(f.changeType)}</span>
        </div>
    </div>
}

function StashFileListComponent(props:IProps){
    const viewMode = useSelectorTyped(state=>state.savedData.configInfo.changeListViewMode);
    const files = props.files || [];

    return <div style={{width:props.width}} className="h-100">
    <div className="d-flex align-items-center justify-content-between ps-1" style={{height:30}}>
        <b>Changed Files({files.length})</b>
        <ChangeListViewModeMenu />
    </div>
    <div className="overflow-auto ps-1" style={{height:`calc(100% - 30px)`}}>
        {viewMode === EnumChangeListViewMode.Tree &&
            <FileTreeRows items={files} renderLeaf={(file,depth)=>(
                <FileRow key={file.path} file={file} depth={depth} showPath={false} onFileSelect={props.onFileSelect} selectedFile={props.selectedFile} />
            )} />
        }
        {viewMode !== EnumChangeListViewMode.Tree && files.map(file=>(
            <FileRow key={file.path} file={file} depth={0} showPath={viewMode === EnumChangeListViewMode.CombinedList}
                onFileSelect={props.onFileSelect} selectedFile={props.selectedFile} />
        ))}
    </div>
</div>
}

export const StashFileList = React.memo(StashFileListComponent)
