import React from "react";
import { shallowEqual } from "react-redux";
import { useSelectorTyped } from "../../../store/rootReducer";
import { EnumHomePageTab } from "../../../store/slices/UiSlice";
import { OpenRepoPanel } from "./OpenRepoPanel";

function RepoSelectionPanelComponent(){
    const store = useSelectorTyped(state=>({
        selectedTab:state.ui.homePageTab,
    }),shallowEqual);

    if(store.selectedTab === EnumHomePageTab.Open) return <OpenRepoPanel />
    return null;
}
export const RepoSelectionPanel = React.memo(RepoSelectionPanelComponent);