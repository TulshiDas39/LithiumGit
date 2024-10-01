import React from "react";
import { RepoSelectionLeft } from "./repoSelectionLeft";
import { RepoSelectionPanel } from "./repoSelectionPanels";

function RepositorySelectionComponent(){
    return <div className="d-flex h-100">
        <RepoSelectionLeft />
        <RepoSelectionPanel />
    </div>
}

export const RepositorySelection = React.memo(RepositorySelectionComponent);