import React from "react";
import { useMemo } from "react";

export interface ISelectedRepoTabItem{
    type:"Changes"|"Branch_Explorer"|"Commits"|"Remotes";
    text:"Changes"|"Branch Explorer"|"Commits"|"Remotes";
}

interface ISelectedRepoLeftProps{
    selectedTab:ISelectedRepoTabItem;
    onSelectTab:(tab:ISelectedRepoTabItem)=>void;
}

function SelectedRepoLeftComponent(props:ISelectedRepoLeftProps){
    const tabs = useMemo(()=>{
        const items:ISelectedRepoTabItem[]=[
            {text:"Changes",type:"Changes"},
            {text:"Branch Explorer",type:"Branch_Explorer"},
            {text:"Commits",type:"Commits"},
            {text:"Remotes",type:"Remotes"}
        ];
        return items;
    },[]);

    return <div id="SelectedRepoLeft" className="d-flex flex-column bg-second-color">  
            {
                tabs.map(t=>(
                    <span key={t.type} 
                        className={`tabItem w-100 py-2 border-bottom hover ${props.selectedTab.type === t.type?"bg-select-color":""}`}
                        onClick={()=> props.onSelectTab(t)}>{t.text}</span>
                ))
            }            
    </div>
}

export const SelectedRepoLeft = React.memo(SelectedRepoLeftComponent);