import React from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { useSelectorTyped } from "../../../store/rootReducer";
import { ActionUI, EnumHomePageTab } from "../../../store/slices/UiSlice";
import './repoSelectionLeft.scss'

interface IHomePageTab{
    name:string;
    type:EnumHomePageTab;
}
const tabs:IHomePageTab[] = [
    {name:"Recents",type:EnumHomePageTab.Recent},
    {name:"Open",type:EnumHomePageTab.Open},
    {name:"Create",type:EnumHomePageTab.Create},
    {name:"Clone",type:EnumHomePageTab.Clone},
]
function RepoSelectionLeftComponent(){
    const store = useSelectorTyped(state=>({
        selectedTab:state.ui.homePageTab,
    }),shallowEqual);
    const dispatch = useDispatch();
    const handleClick = (tab:EnumHomePageTab)=>{
        dispatch(ActionUI.setHomePageTab(tab));
    }
    const activeClass = "bg-fourth-color"
    return <div id="repoSelectionLeft" className="d-flex flex-column border-end bg-second-color">
        {
            tabs.map(tab=>(
                <div key={tab.type} className={`tab py-2 border-bottom px-2 hover ${store.selectedTab === tab.type?activeClass:""}`} 
            onClick={_=> handleClick(tab.type)}>{tab.name}</div>
            ))
        }        
    </div>
}

export const RepoSelectionLeft = React.memo(RepoSelectionLeftComponent);