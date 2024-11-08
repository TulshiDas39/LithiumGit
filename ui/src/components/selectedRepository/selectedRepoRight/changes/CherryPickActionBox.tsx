import React, { useEffect } from "react"
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { EnumModals, useMultiState } from "../../../../lib";
import { ModalData } from "../../../modals/ModalData";
import { ActionModals } from "../../../../store";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { GitUtils } from "../../../../lib/utils/GitUtils";
import { ContinueBox } from "./ContinueBox";

interface IState{
    value:string;
}

function CherryPickActionBoxComponent(){
    const store = useSelectorTyped(state=>({
        cherryPickCommit:state.ui.status?.cherryPickingCommit,
        repoPath:state.savedData?.recentRepositories.find(_=> _.isSelected)?.path,
        conflictedFiles:state.ui.status?.conflicted,
        stagedFiles:state.ui.status!.staged,
    }),shallowEqual);
    const dispatch = useDispatch();
    const [state,setState]= useMultiState<IState>({
        value:""
    });

    useEffect(()=>{        
        setState({value:store.cherryPickCommit?.message || ""});
    },[store.cherryPickCommit])

    const handleContinue=()=>{
        if(!!store.conflictedFiles?.length){
            ModalData.errorModal.message = "Conflicts exist.";
            dispatch(ActionModals.showModal(EnumModals.ERROR));
            return;
        }

        if(!store.stagedFiles.length){
            IpcUtils.doCommit([state.value],["--allow-empty"]).then(r=>{
                IpcUtils.getRepoStatus();
            });
            return ;
        }

        IpcUtils.continueCherryPick().then(()=>{
            IpcUtils.getRepoStatus();
        });
    }

    const handleSkip=()=>{
        IpcUtils.cherryPick(["--skip"]).finally(()=>{
            GitUtils.getStatus();
        })
    }

    const handleAbort=()=>{
        IpcUtils.cherryPick(["--abort"]).finally(()=>{
            GitUtils.getStatus();
        })
    }
    
    return <ContinueBox onAbort={handleAbort} onContinue={handleContinue} 
        onSkip={handleSkip} text={state.value} label="Select cherry pick action." />
}

export const CherryPickActionBox = React.memo(CherryPickActionBoxComponent);