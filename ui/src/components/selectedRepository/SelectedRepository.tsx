import React, { useEffect, useRef } from "react";
import { RepoUtils, CacheUtils, ObjectUtils, ReduxUtils, UiUtils, useMultiState, Data } from "../../lib";
import { SelectedRepoLeft } from "./SelectedRepoLeft";
import { SelectedRepoRight } from "./selectedRepoRight/SelectedRepoRight";
import './SelectedRepository.scss';
import { IStatus, RendererEvents, RepositoryInfo } from "common_library";
import { useSelectorTyped } from "../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { GraphUtils } from "../../lib/utils/GraphUtils";
import { ActionUI } from "../../store/slices/UiSlice";
import { IpcUtils } from "../../lib/utils/IpcUtils";
import { Messages } from "../../lib/constants";
import { GitUtils } from "../../lib/utils/GitUtils";


interface ISelectedRepositoryProps{
    repo:RepositoryInfo
}

interface IState{
}

function SelectedRepositoryComponent(props:ISelectedRepositoryProps){
    const store = useSelectorTyped(state=>({
        branchPanelRefreshVersion:state.ui.versions.branchPanelRefresh,
        status:state.ui.status,
        focusVersion:state.ui.versions.appFocused,
        remoteListRefreshVersion:state.ui.versions.remoteList,
        annotVersion:state.ui.versions.annotations,
    }),shallowEqual);
    const[state,setState]=useMultiState<IState>({});
    const refData = useRef({repo:props.repo,leftWidth:100});
    const dispatch = useDispatch();
    
    ReduxUtils.refreshGraph = ()=>{
        dispatch(ActionUI.increamentVersion("branchPanelRefresh"));
    }

    const getRepoDetails = async ()=>{
        console.log("Getting repository details.");
        const filter = GraphUtils.state.filter.value;
        return IpcUtils.getRepoDetails(props.repo,filter).then(r=>{
            if(!r.error)
                return r.result!;
            throw "Can't load repo details";
        });
    }

    const updateStatus = ()=>{
        dispatch(ActionUI.setSync({text:Messages.getStatus}));
        GitUtils.getStatus().finally(()=>{
            dispatch(ActionUI.setSync(undefined));
        });
    }

    const updateRepoData = async (refresh = false)=>{
        const repo = props.repo;
        RepoUtils.repositoryDetails = (await CacheUtils.getRepoDetails(repo.path))!;
        const status = await IpcUtils.getRepoStatusSync(repo);
        if(refresh || !RepoUtils.repositoryDetails || status?.headCommit?.hash !== RepoUtils.repositoryDetails.status.headCommit?.hash){
            RepoUtils.repositoryDetails = await getRepoDetails();
            RepoUtils.getRepoDetails(RepoUtils.repositoryDetails);
        }
        else{
            RepoUtils.repositoryDetails.status = status;            
        }
        CacheUtils.setRepoDetails(RepoUtils.repositoryDetails);
    }    

    useEffect(()=>{       
        ReduxUtils.setStatus = (status:IStatus)=>{            
            if(RepoUtils.repositoryDetails){
                RepoUtils.repositoryDetails.status = status;
                CacheUtils.setRepoDetails(RepoUtils.repositoryDetails);
            }            
            dispatch(ActionUI.setStatus(new ObjectUtils().deepClone(status)));
        }
        window.ipcRenderer.on(RendererEvents.getStatus().replyChannel,(e,res:IStatus)=>{            
            ReduxUtils.setStatus(res);
        })

        
       
       return ()=>{
        ReduxUtils.setStatus = ()=>{};
        UiUtils.removeIpcListeners([                
            RendererEvents.getStatus().replyChannel,            
        ]);
        dispatch(ActionUI.setStatus(undefined!));
       }
    },[]);

    useEffect(()=>{        
        if(!store.status || !RepoUtils.repositoryDetails)
            return;
        GraphUtils.isRequiredReload().then(requiredReload => {
            if(requiredReload) GraphUtils.refreshGraph();
            else GraphUtils.checkForUiUpdate(store.status!);
        });
        
    },[store.status]);

    const updateGraph=(reloadData = false)=>{
        return updateRepoData(reloadData).then(()=>{
            GraphUtils.createBranchPanel();                
            dispatch(ActionUI.setSync(undefined));
            ReduxUtils.setStatus(RepoUtils.repositoryDetails.status);
            dispatch(ActionUI.setRemotes(new ObjectUtils().deepClone(RepoUtils.repositoryDetails.remotes)));
            dispatch(ActionUI.setBranchList(RepoUtils.repositoryDetails.branchList.slice()));
            dispatch(ActionUI.setGraphRefresh(false));
        });
    }

    useEffect(()=>{
        if(!store.branchPanelRefreshVersion) return;
        dispatch(ActionUI.setSync({text:Messages.refreshing}));
        updateGraph(true);
    },[store.branchPanelRefreshVersion]);

    useEffect(()=>{
        if(!store.remoteListRefreshVersion) return;
        IpcUtils.getRemoteList().then(list=>{
            if(RepoUtils.repositoryDetails){
                RepoUtils.repositoryDetails.remotes = list;
            }
            dispatch(ActionUI.setRemotes(new ObjectUtils().deepClone(list)));
        })
    },[store.remoteListRefreshVersion]);
    
    useEffect(()=>{
        if(!RepoUtils.repositoryDetails)
            return;
        if(store.focusVersion) 
            updateStatus();
    },[store.focusVersion]);

    const getAnnotations = (repoId:string)=>{
        IpcUtils.getAnnotations(repoId).then(r=>{
            if(!r.error){
                Data.annotations = r.result || [];
            }
        });
    }

    useEffect(()=>{        
        getAnnotations(props.repo._id);
    },[store.annotVersion,props.repo])

    useEffect(()=>{
        refData.current.repo = props.repo;
        updateGraph();
    },[props.repo]);

    return <div id="SelectedRepository" className="d-flex h-100">
        <div style={{width:`${refData.current.leftWidth}px`}}>
            <SelectedRepoLeft  />
        </div>
        <div style={{width:`calc(100% - ${refData.current.leftWidth}px)`}} className="overflow-hidden">
            <SelectedRepoRight />
        </div>
    </div>
}

export const SelectedRepository = React.memo(SelectedRepositoryComponent);