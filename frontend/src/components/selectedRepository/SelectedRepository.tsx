import React, { useEffect, useMemo, useRef } from "react";
import { BranchUtils, CacheUtils, ReduxUtils, useDrag, useMultiState } from "../../lib";
import { SelectedRepoLeft } from "./SelectedRepoLeft";
import { SelectedRepoRight2 } from "./selectedRepoRight/SelectedRepoRight2";
import './SelectedRepository.scss';
import { IRepositoryDetails, RendererEvents, RepositoryInfo } from "common_library";
import { useSelectorTyped } from "../../store/rootReducer";
import { shallowEqual } from "react-redux";
import { BranchGraphUtils } from "../../lib/utils/BranchGraphUtils";


interface ISelectedRepositoryProps{
    height:number;
    repo:RepositoryInfo
}

interface IState{
    isLoading:boolean;
}

function SelectedRepositoryComponent(props:ISelectedRepositoryProps){
    const store = useSelectorTyped(state=>({
        branchPanelRefreshVersion:state.ui.versions.branchPanelRefresh,
    }),shallowEqual);
    const[state,setState]=useMultiState<IState>({isLoading:true});
    const leftWidthRef = useRef(200);
    const positionRef = useRef(0);
    const {currentMousePosition:position,elementRef:resizer} = useDrag();

    const refData = useRef({previousRepo:props.repo});
    
    const getRepoDetails = async ()=>{            
        const res:IRepositoryDetails = await window.ipcRenderer.invoke(RendererEvents.getRepositoryDetails().channel,props.repo);
        return res;
    }

    const updateRepoData = async ()=>{
        let res = await CacheUtils.getRepoDetails(props.repo.path);
        if(!res){
            res = await getRepoDetails();
            BranchUtils.getRepoDetails(res);
        }
        BranchUtils.repositoryDetails = res;
        ReduxUtils.setStatusCurrent(res.status);                        
        if(state.isLoading)
            setState({isLoading:false});
        BranchGraphUtils.createBranchPanel();
        
    }

    useEffect(()=>{                       
       updateRepoData();
    },[]);

    useEffect(()=>{
        if(!store.branchPanelRefreshVersion) return;
        // setState({repoDetails:undefined});
        getRepoDetails();
    },[store.branchPanelRefreshVersion]); 

    const leftWidth = useMemo(()=>{
        if(!position){
            leftWidthRef.current += positionRef.current;
            positionRef.current = 0;
            return leftWidthRef.current;
        }
        positionRef.current = position.x;
        return leftWidthRef.current + positionRef.current;
    },[position?.x])

    useEffect(()=>{
        if(refData.current.previousRepo != props.repo){
            updateRepoData();
            refData.current.previousRepo = props.repo;
        }
    },[props.repo]);

    if(state.isLoading) return <p className="text-center">Loading...</p>;
    return <div id="SelectedRepository" className="d-flex h-100">
        <div style={{width:`${leftWidth - 3}px`}}>
            <SelectedRepoLeft height={props.height}  />
        </div>
        <div ref={resizer as any} className="bg-second-color cur-resize" style={{ width: '3px' }} />
        <div style={{width:`calc(100% - ${leftWidth}px)`}} className="overflow-hidden">
            <SelectedRepoRight2 height={props.height} />
        </div>
    </div>
}

export const SelectedRepository = React.memo(SelectedRepositoryComponent);