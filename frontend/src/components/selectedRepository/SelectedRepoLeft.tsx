import React from "react";
import { useMemo } from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { EnumSelectedRepoTab } from "../../lib";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionUI } from "../../store/slices/UiSlice";

export interface ISelectedRepoTabItem{
    type:EnumSelectedRepoTab;
    text:"Changes"|"Branches"|"Commits"|"Remotes";
}

function SelectedRepoLeftComponent(){
    const dispatch = useDispatch();
    const store = useSelectorTyped(state=>({
        tab:state.ui.selectedRepoTab,        
    }),shallowEqual);

    const tabs = useMemo(()=>{
        const items:ISelectedRepoTabItem[]=[
            {text:"Changes",type:EnumSelectedRepoTab.CHANGES},
            {text:"Branches",type:EnumSelectedRepoTab.BRANCHES},
            {text:"Commits",type:EnumSelectedRepoTab.COMMITS},
            {text:"Remotes",type: EnumSelectedRepoTab.REMOTES}
        ];
        return items;
    },[]);

    return <div id="SelectedRepoLeft" className="d-flex w-100 flex-column bg-second-color h-100">  
            {
                tabs.map(t=>(
                    <span key={t.type} 
                        className={`tabItem w-100 py-2 border-bottom hover ${store.tab === t.type?"bg-select-color":""}`}
                        onClick={()=> dispatch(ActionUI.setSelectedRepoTab(t.type))}>{t.text}</span>
                ))
            }            
    </div>
}

export const SelectedRepoLeft = React.memo(SelectedRepoLeftComponent);