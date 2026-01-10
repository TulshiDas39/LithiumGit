import React from "react";
import { shallowEqual } from "react-redux";
import { useSelectorTyped } from "../../../store/rootReducer";
import { ChangeNavigator } from "./ChangeNavigator";
import { PullPushMenu } from "./PullPushMenu";
import { RepoSelectionDropdown } from "./RepoSelectionDropdown";
import { EnumSelectedRepoTab } from "../../../lib";

function ActionBarComponent(){
    const store = useSelectorTyped(state=>({
        tab:state.ui.selectedRepoTab,
        selectedFile:state.changes.selectedFile,
    }),shallowEqual);

    return <div className="d-flex">
            <RepoSelectionDropdown />
            <PullPushMenu />
            {!!store.selectedFile && store.tab == EnumSelectedRepoTab.CHANGES && <ChangeNavigator /> }
    </div>;
}

export const ActionBar = React.memo(ActionBarComponent);