import React from "react";
import { ChangeNavigator } from "./ChangeNavigator";
import { RepoSelectionDropdown } from "./RepoSelectionDropdown";

function ActionBarComponent(){
    
    return <div className="d-flex">
            <RepoSelectionDropdown />
            <ChangeNavigator />
    </div>;
}

export const ActionBar = React.memo(ActionBarComponent);