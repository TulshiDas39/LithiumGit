import { RendererEvents,RepositoryInfo } from "common_library";
// import { ipcRenderer } from "electron";
import React from "react";
import { useEffect } from "react";
import {useDispatch,shallowEqual} from "react-redux";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionSavedData } from "../../store/slices";
import { RepositorySelection } from "../repositorySelection";
import { SelectedRepository } from "../selectedRepository";

function MainComponent(){
    const dispatch = useDispatch();
    const store = useSelectorTyped(state=>({
        recentRepos:state.savedData.recentRepositories
    }),shallowEqual);
    console.log("main component");
    useEffect(()=>{
        const repos:RepositoryInfo[] =  window.ipcRenderer.sendSync(RendererEvents.getRecentRepositoires);
        console.log('recent repos');
        console.log(repos);
        dispatch(ActionSavedData.setRecentRepositories(repos));
    },[]);
    return <div>
        {true? <RepositorySelection />:<SelectedRepository />}
    </div>
}

export const Main = React.memo(MainComponent);