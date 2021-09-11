import React from "react";
import { useMemo } from "react";

export interface ISelectedRepoTabItem{
    type:"Changes"|"Branches"|"Commits"|"Remotes";
    text:"Changes"|"Branches"|"Commits"|"Remotes";
}

interface ISelectedRepoLeftProps{
    selectedTab:ISelectedRepoTabItem;
    onSelectTab:(tab:ISelectedRepoTabItem)=>void;
}

function SelectedRepoLeftComponent(props:ISelectedRepoLeftProps){
    const tabs = useMemo(()=>{
        const items:ISelectedRepoTabItem[]=[
            {text:"Changes",type:"Changes"},
            {text:"Branches",type:"Branches"},
            {text:"Commits",type:"Commits"},
            {text:"Remotes",type:"Remotes"}
        ];
        return items;
    },[]);

    return <div id="SelectedRepoLeft" className="d-flex w-100 flex-column bg-second-color h-100">  
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