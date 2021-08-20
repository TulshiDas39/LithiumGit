import React from "react";
import { RepoSelectionDropdown } from "./RepoSelectionDropdown";

function ActionBarComponent(){
    
    return <div>
            <RepoSelectionDropdown />
    </div>;
}

export const ActionBar = React.memo(ActionBarComponent);