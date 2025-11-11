import { useMemo } from "react";
import { IFileProps } from "../../../../lib";
import { StringUtils } from "common_library";

interface IProps{
    prevFileProps?:IFileProps;
    currentFileProps?:IFileProps;
}

function DifferencePreview(props:IProps){
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
        return props.fileInfo.sizeKB/1024;
    },[props.fileInfo.sizeKB])

    return <div>
        <div className="text-center">
            {fileName}
        </div>
        <div>
            {sizeMB} MB
        </div>
    </div>
}