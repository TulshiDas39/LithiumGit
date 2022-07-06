import React from "react";
import { ChangeNavigator } from "./ChangeNavigator";
import { PullPushMenu } from "./PullPushMenu";
import { RepoSelectionDropdown } from "./RepoSelectionDropdown";

function ActionBarComponent(){
    
    return <div className="d-flex">
            <RepoSelectionDropdown />
            <ChangeNavigator />
            <PullPushMenu />
    </div>;
}

export const ActionBar = React.memo(ActionBarComponent);