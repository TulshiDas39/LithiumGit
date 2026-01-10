import { EnumModals, useMultiState } from "../../../../lib";
import React, { useEffect } from "react";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { ModalData } from "../../../modals/ModalData";
import { ActionModals } from "../../../../store";
import { GitUtils } from "../../../../lib/utils/GitUtils";
import { ContinueBox } from "./ContinueBox";

interface IState{
    value:string;
}

function RebaseActionBoxComponent(){
    const store = useSelectorTyped(state=>({
        rebaseCommit:state.ui.status?.rebasingCommit,
        repoPath:state.savedData?.recentRepositories.find(_=> _.isSelected)?.path,
        conflictedFiles:state.ui.status?.conflicted,
    }),shallowEqual);
    const dispatch = useDispatch();
    const [state,setState]= useMultiState<IState>({
        value:""
    });

    useEffect(()=>{        
        setState({value:store.rebaseCommit?.message || ""});
    },[store.rebaseCommit])

    const handleContinue=()=>{
        if(!!store.conflictedFiles?.length){
            ModalData.errorModal.message = "Conflicts exist.";
            dispatch(ActionModals.showModal(EnumModals.ERROR));
            return;
        }
        IpcUtils.continueRebase().then(()=>{
            IpcUtils.getRepoStatus();
        });
    }

    const handleSkip=()=>{
        IpcUtils.skipRebase().finally(()=>{
            GitUtils.getStatus();
        })
    }

    const handleAbort=()=>{
        IpcUtils.abortRebase().finally(()=>{
            GitUtils.getStatus();
        })
    }
    
    return <ContinueBox onAbort={handleAbort} onContinue={handleContinue} 
        onSkip={handleSkip} text={state.value} label="Select rebase action." />
}

export const RebaseActionBox = React.memo(RebaseActionBoxComponent);