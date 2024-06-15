import React, { useMemo, useRef } from "react"
import { NumUtils, useDrag, useMultiState } from "../../../../lib";
import { StashFileList } from "./StashFileList";
import { IFile, IStash } from "common_library";

interface IProps{
    stash?:IStash;
}

interface IState{
    selectedCommitHash?:string;
    selectedFile?:IFile;
}

function StashChangeViewComponent(props:IProps){
    const [state, setState] = useMultiState<IState>({});
    const rightWidthRef = useRef(300);
    const positionRef = useRef(0);
    const {currentMousePosition:position,elementRef:resizer} = useDrag();
    
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

    return <div className="d-flex w-100 h-100">
        <div style={{width:`calc(100% - ${rightWidth+3}px)`}}>
            {/* <CommitDiffView file={state.selectedFile} /> */}
        </div>
        <div ref={resizer as any} className="bg-second-color cur-resize" style={{width:`3px`}}></div>
        <StashFileList files={props.stash?.changedFiles} width={rightWidth} onFileSelect={_=>setState({selectedFile:_})}
            selectedFile={state.selectedFile} />
    </div>
}

export const StashChangeView = React.memo(StashChangeViewComponent);