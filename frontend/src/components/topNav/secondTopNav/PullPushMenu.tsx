import React, { useMemo } from "react"
import { shallowEqual } from "react-redux";
import { BranchUtils } from "../../../lib";
import { useSelectorTyped } from "../../../store/rootReducer";

function PullPushMenuComponent(){
    const store = useSelectorTyped(state=>({
        repoDetailsVersion:state.ui.versions.repoDetails,
    }),shallowEqual);

    console.log("store.repoDetailsVersion",store.repoDetailsVersion);
    console.log("BranchUtils.repositoryDetails",BranchUtils.repositoryDetails);
    const checkoutBranchOrCommitHashName = useMemo(()=>{
        if(!BranchUtils.repositoryDetails?.status) return "";
        if(BranchUtils.repositoryDetails.status.isDetached) return BranchUtils.repositoryDetails.headCommit.avrebHash+"(detached)";
        return BranchUtils.repositoryDetails.status.current;
    },[store.repoDetailsVersion]);

    return <div className="row g-0 align-items-center ps-2">
        <div className="col-auto">{checkoutBranchOrCommitHashName}</div>
    </div>
}

export const PullPushMenu = React.memo(PullPushMenuComponent);