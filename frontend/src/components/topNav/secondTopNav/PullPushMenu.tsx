import React from "react"
import { shallowEqual } from "react-redux";
import { BranchUtils } from "../../../lib";
import { useSelectorTyped } from "../../../store/rootReducer";

function PullPushMenuComponent(){
    const store = useSelectorTyped(state=>({
        current:state.repository.statusCurrent,
    }),shallowEqual);

    // console.log("store.repoDetailsVersion",store.repoDetailsVersion);
    console.log("BranchUtils.repositoryDetails",BranchUtils.repositoryDetails);
    // const checkoutBranchOrCommitHashName = useMemo(()=>{
    //     if(!store.current) return "";
    //     if(BranchUtils.repositoryDetails.status.isDetached) return store.current+"(detached)";
    //     return store.current;
    // },[store.current]);

    return <div className="row g-0 align-items-center ps-2">
        <div className="col-auto">{store.current}</div>
    </div>
}

export const PullPushMenu = React.memo(PullPushMenuComponent);