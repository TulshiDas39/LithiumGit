import React from "react"
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual } from "react-redux";
import { EnumConfigTab } from "../../../../lib";
import { UserConfig } from "./UserConfig";

function ConfigRightComponent(){
    const store = useSelectorTyped((state)=>({
        tab:state.ui.configTab,
    }),shallowEqual);

    return <div>
        {store.tab === EnumConfigTab.USER && <UserConfig />}
    </div>
}

export const ConfigRight = React.memo(ConfigRightComponent);