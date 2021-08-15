import React from "react";
import { shallowEqual } from "react-redux";
import { useSelectorTyped } from "../../../store/rootReducer";
import { EnumHomePageTab } from "../../../store/slices/UiSlice";
import { OpenRepoPanel } from "./OpenRepoPanel";
import { RecentRepositoryPanel } from "./recentRepositoryPanel";

function RepoSelectionPanelComponent(){
    const store = useSelectorTyped(state=>({
        selectedTab:state.ui.homePageTab,
    }),shallowEqual);
    
    return <div className="flex-grow-1">
        {store.selectedTab === EnumHomePageTab.Open && <OpenRepoPanel />}
        {store.selectedTab === EnumHomePageTab.Recent && <RecentRepositoryPanel />}
    </div>;
}
export const RepoSelectionPanel = React.memo(RepoSelectionPanelComponent);