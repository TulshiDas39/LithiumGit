import React from "react";
import {FaHome} from "react-icons/fa"
import { batch, shallowEqual, useDispatch } from "react-redux";
import { useSelectorTyped } from "../../../store/rootReducer";
import { ActionSavedData } from "../../../store/slices";
import { ActionUI, EnumHomePageTab } from "../../../store/slices/UiSlice";
import { ActionBar } from "./ActionBar";

function SecondTopNavComponent(){
    const store = useSelectorTyped(state=>({
        hasSelectedRepo:state.savedData.recentRepositories.some(x=>x.isSelected),
        recentRepos:state.savedData.recentRepositories,
    }),shallowEqual);
    const dispatch = useDispatch();
    
    const handleHomeClick=()=>{
        let selectedTab = EnumHomePageTab.Recent;
        if(!store.recentRepos.length) selectedTab = EnumHomePageTab.Open;
        batch(()=>{
            dispatch(ActionSavedData.deSelectRepo());
            dispatch(ActionUI.setHomePageTab(selectedTab));
        });
        
    }

    return <div className="d-flex bg-third-color py-2 align-items-center h-100">
        <span className="px-2 hover">
            <FaHome className="h5 mb-0" onClick={handleHomeClick} />
        </span>
        {store.hasSelectedRepo && <ActionBar />}        
    </div>
}

export const SecondTopNav = React.memo(SecondTopNavComponent);