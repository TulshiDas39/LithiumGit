import React from "react"
import { BranchesView } from "./branches/BranchesView"
import { Changes } from "./changes"
import { useSelectorTyped } from "../../../store/rootReducer"
import { shallowEqual } from "react-redux"
import { EnumSelectedRepoTab } from "../../../lib"
import { RemoteList } from "./remotes"

function SelectedRepoRightComponent(){
    const store = useSelectorTyped(state=>({
        tab:state.ui.selectedRepoTab,
    }),shallowEqual);

    return <div className="d-flex w-100 h-100">
        <Changes />
        <BranchesView />
        {store.tab === EnumSelectedRepoTab.REMOTES && 
            <RemoteList />}
    </div>    
}

export const SelectedRepoRight = React.memo(SelectedRepoRightComponent);