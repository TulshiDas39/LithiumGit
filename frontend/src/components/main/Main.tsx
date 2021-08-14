import { RendererEvents,RepositoryInfo } from "common_library";
import React from "react";
import { useEffect } from "react";
import {useDispatch,shallowEqual} from "react-redux";
import { useMultiState } from "../../lib";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionSavedData } from "../../store/slices";
import { RepositorySelection } from "../repositorySelection";
import { SelectedRepository } from "../selectedRepository";

interface IState{
    isLoading:boolean;
}

const initialState = {
    isLoading:true,
} as IState;

function MainComponent(){
    const dispatch = useDispatch();
    const store = useSelectorTyped(state=>({
        selectedRepo:state.savedData.recentRepositories.find(x=>x.isSelected)
    }),shallowEqual);
    const [state,setState] = useMultiState(initialState);
    
    useEffect(()=>{
        const repos:RepositoryInfo[] =  window.ipcRenderer.sendSync(RendererEvents.getRecentRepositoires);        
        dispatch(ActionSavedData.setRecentRepositories(repos));
        setState({isLoading:false});
    },[]);
    if(state.isLoading) return null;
    return <div className="h-100">
        {store.selectedRepo ? <SelectedRepository />:<RepositorySelection />}
    </div>
}

export const Main = React.memo(MainComponent);