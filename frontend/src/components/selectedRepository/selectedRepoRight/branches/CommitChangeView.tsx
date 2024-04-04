import React, { useEffect } from "react"
import { BranchGraphUtils, useMultiState } from "../../../../lib";
import { ICommitInfo, IFile } from "common_library";
import { GitUtils } from "../../../../lib/utils/GitUtils";
import { CommitFileList } from "./CommitFileList";

interface IState{
    selectedCommitHash?:string;
    files:IFile[];
}

function CommitChangeViewComponent(){
    const [state, setState] = useMultiState<IState>({files:[]});

    useEffect(()=>{
        if(!state.selectedCommitHash)
            return;
        
        GitUtils.GetFileListByCommit(state.selectedCommitHash).then(res=>{
            console.log(res);
            setState({files:res});
        });



    },[state.selectedCommitHash])
    
    useEffect(()=>{
        const listener = (commit?:ICommitInfo)=>{
            setState({selectedCommitHash:commit?.hash});
        }
        BranchGraphUtils.state.selectedCommit.subscribe(listener);
        return ()=>{
            BranchGraphUtils.state.selectedCommit.unSubscribe(listener);
        }
    },[])

    return <div className="d-flex w-100 h-100">
        <div style={{width:`calc(100% - 303px)`}}>
        </div>
        <div className="bg-second-color cur-resize" style={{width:`3px`}}></div>
        <CommitFileList files={state.files} />
    </div>
}

export const CommitChangeView = React.memo(CommitChangeViewComponent);