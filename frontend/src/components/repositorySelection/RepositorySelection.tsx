import React from "react";
import { Recents } from "./recents/Recents";
import { RepoSelectionPanel } from "./RepoSelectionPanel";

function RepositorySelectionComponent(){
    return <div className="d-flex">
        <Recents />
        <RepoSelectionPanel />
    </div>
}

export const RepositorySelection = React.memo(RepositorySelectionComponent);