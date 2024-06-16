import React, { useEffect, useMemo, useRef } from "react"
import { NumUtils, RepoUtils, useDrag, useMultiState } from "../../../../lib";
import { StashFileList } from "./StashFileList";
import { IFile, IStash } from "common_library";
import { GitUtils } from "../../../../lib/utils/GitUtils";
import { StashDiffView } from "./StashDiffView";

interface IProps{
    stash?:IStash;
}

interface IState{
    selectedFile?:IFile;
    changedFiles?:IFile[];
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
    },[position?.x]);

    useEffect(()=>{
        if(!props.stash?.hash){
            setState({changedFiles:[],selectedFile:undefined});
            return;
        }
        const head = RepoUtils.repositoryDetails.headCommit?.hash;        
        GitUtils.GetFileListByCommit(props.stash?.hash,[head]).then(res=>{
            setState({changedFiles:res,selectedFile:res[0]});
        });
    },[props.stash?.hash])

    return <div className="d-flex w-100 h-100">
        <div style={{width:`calc(100% - ${rightWidth+3}px)`}}>
            <StashDiffView stash={props.stash} file={state.selectedFile} />
        </div>
        <div ref={resizer as any} className="bg-second-color cur-resize" style={{width:`3px`}}></div>
        <StashFileList files={state?.changedFiles} width={rightWidth} onFileSelect={_=>setState({selectedFile:_})}
            selectedFile={state.selectedFile} />
    </div>
}

export const StashChangeView = React.memo(StashChangeViewComponent);