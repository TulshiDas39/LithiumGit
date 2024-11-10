import React, { useEffect, useMemo, useRef } from "react"
import { EnumHtmlIds, GraphUtils, NumUtils, useDrag, useMultiState } from "../../../../lib";
import { ICommitInfo, IFile } from "common_library";
import { GitUtils } from "../../../../lib/utils/GitUtils";
import { CommitFileList } from "./CommitFileList";
import { CommitDiffView } from "./CommitDiffView";

interface IProps{
    selectedCommit:ICommitInfo;
    containerId:EnumHtmlIds;
}

interface IState{
    files:IFile[];
    selectedFile?:IFile;
    fileCount:number;
}

function CommitChangeViewComponent(props:IProps){
    const [state, setState] = useMultiState<IState>({files:[],fileCount:0});
    const rightWidthRef = useRef(300);
    const positionRef = useRef(0);
    const {currentMousePosition:position,elementRef:resizer} = useDrag();
    useEffect(()=>{
        if(!props.selectedCommit || props.selectedCommit.inMergingState){
            setState({files:[],selectedFile:undefined});
            return;
        }
        
        GitUtils.GetFileListByCommit(props.selectedCommit.hash).then(res=>{
            setState({files:res.files,selectedFile:res.files[0],fileCount:res.total});
        });

    },[props.selectedCommit.hash])

    const rightWidth = useMemo(()=>{
        const curWidth = rightWidthRef.current - positionRef.current;
        const width = NumUtils.between(100,600,curWidth);
        if(!position){
            rightWidthRef.current = width;
            positionRef.current = 0;
        }
        else{
            positionRef.current = position.x;
        }
        return width;
    },[position?.x])
    
    useEffect(()=>{
        
    },[])

    return <div className="d-flex w-100 h-100">
        <div style={{width:`calc(100% - ${rightWidth+3}px)`}}>
            <CommitDiffView file={state.selectedFile} commit={props.selectedCommit} containerId={props.containerId} />
        </div>
        <div ref={resizer as any} className="bg-second-color cur-resize" style={{width:`3px`}}></div>
        <CommitFileList files={state.files} width={rightWidth} onFileSelect={_=>setState({selectedFile:_})}
            selectedFile={state.selectedFile} fileCount={state.fileCount} />
    </div>
}

export const CommitChangeView = React.memo(CommitChangeViewComponent);