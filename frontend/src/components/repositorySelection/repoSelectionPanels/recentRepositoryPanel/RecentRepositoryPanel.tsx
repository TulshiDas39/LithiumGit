import React from "react";
import { RecentRepositoryList } from "./RecentRepositoryList";
import { SelectedRecentRepoProperties } from "./SelectedRecentRepoProperties";
import './recentRepoPanel.scss';
import { RepositoryInfo } from "common_library";
import { useMultiState } from "../../../../lib";

interface IState{
    selectedItem?:RepositoryInfo;
}

function RecentRepositoryPanelComponent(){
    const [state,setState] = useMultiState<IState>({});
    const handleSelect=(item:RepositoryInfo)=>{
        setState({selectedItem:item});
    }
    return <div id="recentRepoPanel" className="d-flex h-100">
        <RecentRepositoryList onSelectItem={handleSelect} selectedItem={state.selectedItem} />
        <SelectedRecentRepoProperties />
    </div>
}

export const RecentRepositoryPanel = React.memo(RecentRepositoryPanelComponent);