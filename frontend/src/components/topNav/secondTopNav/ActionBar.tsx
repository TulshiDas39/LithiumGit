import React from "react";
import { shallowEqual } from "react-redux";
import { EnumSelectedRepoTab } from "../../../lib";
import { useSelectorTyped } from "../../../store/rootReducer";
import { ChangeNavigator } from "./ChangeNavigator";
import { PullPushMenu } from "./PullPushMenu";
import { RepoSelectionDropdown } from "./RepoSelectionDropdown";

function ActionBarComponent(){
    const store = useSelectorTyped(state=>({
        tab:state.ui.selectedRepoTab
    }),shallowEqual);

    return <div className="d-flex">
            <RepoSelectionDropdown />
            <PullPushMenu />
            {store.tab === EnumSelectedRepoTab.CHANGES && <ChangeNavigator /> }
    </div>;
}

export const ActionBar = React.memo(ActionBarComponent);