import React, { useEffect, useMemo, useRef } from "react"
import { BranchGraphUtils, useDrag, useMultiState } from "../../../../lib";
import { ICommitInfo, IFile } from "common_library";
import { GitUtils } from "../../../../lib/utils/GitUtils";
import { CommitFileList } from "./CommitFileList";
import { CommitDiffView } from "./CommitDiffView";

interface IState{
    selectedCommitHash?:string;
    files:IFile[];
    selectedFile?:IFile;
}

function CommitChangeViewComponent(){
    const [state, setState] = useMultiState<IState>({files:[]});
    const rightWidthRef = useRef(300);
    const positionRef = useRef(0);
    const {currentMousePosition:position,elementRef:resizer} = useDrag();
    useEffect(()=>{
        if(!state.selectedCommitHash)
            return;
        
        GitUtils.GetFileListByCommit(state.selectedCommitHash).then(res=>{
            console.log(res);
            setState({files:res,selectedFile:res[0]});
        });

    },[state.selectedCommitHash])

    const rightWidth = useMemo(()=>{
        if(!position){
            rightWidthRef.current -= positionRef.current;
            positionRef.current = 0;
            return rightWidthRef.current;
        }
        positionRef.current = position.x;
        return rightWidthRef.current - positionRef.current;
    },[position?.x])
    
    useEffect(()=>{
        const listener = (commit?:ICommitInfo)=>{
            setState({selectedCommitHash:commit?.hash,selectedFile:undefined});
        }
        BranchGraphUtils.state.selectedCommit.subscribe(listener);
        return ()=>{
            BranchGraphUtils.state.selectedCommit.unSubscribe(listener);
        }
    },[])

    return <div className="d-flex w-100 h-100">
        <div style={{width:`calc(100% - ${rightWidth+3}px)`}}>
            <CommitDiffView file={state.selectedFile} />
        </div>
        <div ref={resizer as any} className="bg-second-color cur-resize" style={{width:`3px`}}></div>
        <CommitFileList files={state.files} width={rightWidth} onFileSelect={_=>setState({selectedFile:_})}
            selectedFile={state.selectedFile} />
    </div>
}

export const CommitChangeView = React.memo(CommitChangeViewComponent);