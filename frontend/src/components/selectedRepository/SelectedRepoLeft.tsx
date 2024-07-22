import React from "react";
import { useMemo } from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { EnumSelectedRepoTab } from "../../lib";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionUI } from "../../store/slices/UiSlice";
import { FaCog } from "react-icons/fa";

export interface ISelectedRepoTabItem{
    type:EnumSelectedRepoTab;
    text:string;
    marked?:boolean;
    className?:string;
    innerHtml?:JSX.Element;
    title?:string;
}

function SelectedRepoLeftComponent(){
    const dispatch = useDispatch();
    const store = useSelectorTyped(state=>({
        tab:state.ui.selectedRepoTab,
        hasChanges:!!state.ui.status?.totalChangedItem,
    }),shallowEqual);

    const tabs = useMemo(()=>{
        const items:ISelectedRepoTabItem[]=[
            {text:"Changes",type:EnumSelectedRepoTab.CHANGES,marked:store.hasChanges},
            {text:"Graph",type:EnumSelectedRepoTab.GRAPH},
            {text:"Commits",type:EnumSelectedRepoTab.COMMITS},
            {text:"Stashes",type: EnumSelectedRepoTab.STASHES},
            {text:"Remotes",type: EnumSelectedRepoTab.REMOTES},                       
        ];
        return items;
    },[store.hasChanges]);

    return <div id="SelectedRepoLeft" className="d-flex w-100 flex-column bg-second-color h-100">  
            {
                tabs.map(t=>(
                    <span key={t.type} title={t.title || ""}
                        className={`tabItem w-100 py-2 hover ps-1 border-bottom 
                            ${t.className ? t.className:""} ${store.tab === t.type?"bg-select-color":""}`}
                        onClick={()=> dispatch(ActionUI.setSelectedRepoTab(t.type))}>
                            <span className="">{t.text}</span>
                            {!!t.innerHtml && t.innerHtml}
                            {!!t.marked && <span className="text-primary">*</span>}
                    </span>
                ))
            }

            <span className={`w-100 flex-grow-1 d-flex align-items-end justify-content-center`}>
                <span className={`tabItem py-2 hover ps-1 border-bottom w-100 text-center ${store.tab === EnumSelectedRepoTab.CONFIG?"bg-select-color":""}`} title="Configuration"
                onClick={()=> dispatch(ActionUI.setSelectedRepoTab(EnumSelectedRepoTab.CONFIG))}>
                    <span style={{fontSize:'2.5em'}}><FaCog /></span>
                </span>
            </span>            
    </div>
}

export const SelectedRepoLeft = React.memo(SelectedRepoLeftComponent);