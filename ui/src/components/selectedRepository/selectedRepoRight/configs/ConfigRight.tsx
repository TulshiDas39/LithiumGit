import React from "react"
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual } from "react-redux";
import { EnumConfigTab } from "../../../../lib";
import { UserConfig } from "./UserConfig";
import { RemoteList } from "./remotes";

function ConfigRightComponent(){
    const store = useSelectorTyped((state)=>({
        tab:state.ui.configTab,
    }),shallowEqual);

    return <div className="h-100" style={{width:`calc(100% - 100px)`}}>
        {store.tab === EnumConfigTab.USER && <UserConfig />}
        {store.tab === EnumConfigTab.REMOTES && <RemoteList />}
    </div>
}

export const ConfigRight = React.memo(ConfigRightComponent);