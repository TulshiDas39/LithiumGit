import React from "react";
import { RecentRepositoryList } from "./RecentRepositoryList";
import { SelectedRecentRepoProperties } from "./SelectedRecentRepoProperties";
import './recentRepoPanel.scss';

function RecentRepositoryPanelComponent(){
    return <div id="recentRepoPanel" className="d-flex h-100">
        <RecentRepositoryList />
        <SelectedRecentRepoProperties />
    </div>
}

export const RecentRepositoryPanel = React.memo(RecentRepositoryPanelComponent);