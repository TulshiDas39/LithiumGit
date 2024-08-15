import React, { useEffect, useMemo, useRef } from "react";
import { RepoUtils, CacheUtils, ObjectUtils, ReduxUtils, UiUtils, useDrag, useMultiState, NumUtils, Data } from "../../lib";
import { SelectedRepoLeft } from "./SelectedRepoLeft";
import { SelectedRepoRight } from "./selectedRepoRight/SelectedRepoRight";
import './SelectedRepository.scss';
import { IRepositoryDetails, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import { useSelectorTyped } from "../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { GraphUtils } from "../../lib/utils/GraphUtils";
import { ActionUI } from "../../store/slices/UiSlice";
import { IpcUtils } from "../../lib/utils/IpcUtils";
import { ChangeUtils } from "../../lib/utils/ChangeUtils";
import { ActionSavedData } from "../../store";
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
    const refData = useRef({repo:props.repo,leftMinWidth:100});
    const leftWidthRef = useRef(refData.current.leftMinWidth);
    const positionRef = useRef(0);
    const {currentMousePosition:position,elementRef:resizer} = useDrag();
    const dispatch = useDispatch();
    
    const getRepoDetails = async ()=>{            
        const res:IRepositoryDetails = await window.ipcRenderer.invoke(RendererEvents.getRepositoryDetails().channel,props.repo);
        return res;
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
            if(requiredReload) dispatch(ActionUI.increamentVersion("branchPanelRefresh"));
            else GraphUtils.checkForUiUpdate(store.status!);
        });
        
    },[store.status]);

    useEffect(()=>{
        if(!store.branchPanelRefreshVersion) return;
        dispatch(ActionUI.setSync({text:Messages.refreshing}));
        updateRepoData(true).then(()=>{
            GraphUtils.createBranchPanel();                
            dispatch(ActionUI.setLoader(undefined));
            dispatch(ActionUI.setSync(undefined));
            ReduxUtils.setStatus(RepoUtils.repositoryDetails.status);
            dispatch(ActionUI.setRemotes(new ObjectUtils().deepClone(RepoUtils.repositoryDetails.remotes)));
            dispatch(ActionUI.setBranchList(RepoUtils.repositoryDetails.branchList.slice()));
            dispatch(ActionUI.setGraphRefresh(false));
        });
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

    const leftWidth = useMemo(()=>{
        const curWidth = leftWidthRef.current + positionRef.current;
        const width = NumUtils.between(refData.current.leftMinWidth, 500, curWidth);
        if(!position){
            leftWidthRef.current = width;
            positionRef.current = 0;
        }
        else{
            positionRef.current = position.x;
        }
        return width;
    },[position?.x])

    useEffect(()=>{
        if(!GraphUtils.svgContainer)
            return;
        GraphUtils.resizeHandler();
    },[leftWidth])

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
        updateRepoData().then(_=>{     
            GraphUtils.createBranchPanel();
            ReduxUtils.setStatus(RepoUtils.repositoryDetails.status);
            dispatch(ActionUI.setRemotes(new ObjectUtils().deepClone(RepoUtils.repositoryDetails.remotes)));
            dispatch(ActionUI.setBranchList(RepoUtils.repositoryDetails.branchList.slice()));
        });
    },[props.repo]);

    return <div id="SelectedRepository" className="d-flex h-100">
        <div style={{width:`${leftWidth - 3}px`}}>
            <SelectedRepoLeft  />
        </div>
        <div ref={resizer as any} className="bg-second-color cur-resize" style={{ width: '3px' }} />
        <div style={{width:`calc(100% - ${leftWidth}px)`}} className="overflow-hidden">
            <SelectedRepoRight />
        </div>
    </div>
}

export const SelectedRepository = React.memo(SelectedRepositoryComponent);