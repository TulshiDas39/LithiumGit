import { useMemo } from "react";
import { IFileProps } from "../../../../lib";
import { StringUtils } from "common_library";

interface IProps{
    prevFileProps?:IFileProps;
    currentFileProps?:IFileProps;
}

export function DifferencePreview(props:IProps){
    return <div className="d-flex w-100 h-100 difference" style={{overflowY:'hidden'}}>
            {!!props.prevFileProps && <div className={`h-100 w-${!!props.currentFileProps?"50":"100"} previous `}>
                <FilePreview changeType="previous" fileInfo={props.prevFileProps!} />
            </div>}
            {!!props.currentFileProps && <div className={`h-100 w-${!!props.prevFileProps?"50":"100"} ps-2 current`}>
                <FilePreview changeType="current" fileInfo={props.currentFileProps} />
            </div>}
        </div>
}

interface IFilePreviewProps{
    fileInfo:IFileProps;
    changeType:"previous" | "current";
}

function FilePreview(props:IFilePreviewProps){
    const fileName = useMemo(()=>{
        return StringUtils.getFileName(props.fileInfo.path);
    },[props.fileInfo.path])

    const sizeMB = useMemo(()=>{
        return Number((props.fileInfo.sizeKB/1024).toFixed(2));
    },[props.fileInfo.sizeKB])

    return <div>
        <div className="d-flex justify-content-center pt-4" >
            <span className="overflow-ellipsis" style={{maxWidth:300}} title={fileName}>
                {fileName}
            </span>
        </div>
        <div className="d-flex justify-content-center">
            <span className="overflow-ellipsis" style={{maxWidth:100}} title={sizeMB+" MB"}>
                {sizeMB} MB
            </span>
        </div>
    </div>
}