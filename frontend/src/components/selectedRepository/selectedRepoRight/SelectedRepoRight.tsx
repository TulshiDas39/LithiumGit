import { ICommitInfo, IRepositoryDetails, RendererEvents } from "common_library"
import React, { useEffect } from "react"
import { shallowEqual, useDispatch } from "react-redux"
import { BranchUtils, CacheUtils, EnumIdPrefix, UiUtils, useMultiState } from "../../../lib"
import { useSelectorTyped } from "../../../store/rootReducer"
import { ActionUI } from "../../../store/slices/UiSlice"
import { ISelectedRepoTabItem } from "../SelectedRepoLeft"
import { BranchesView } from "./branches"
import { Changes } from "./changes"

interface ISelectedRepoRightProps{
    selectedTab:ISelectedRepoTabItem["type"];
}

interface IState{
    selectedCommit?:ICommitInfo;
    repoDetails?:IRepositoryDetails;
}

function SelectedRepoRightComponent(props:ISelectedRepoRightProps){
    const [state,setState] = useMultiState<IState>({});
    const dispatch = useDispatch();

    const store = useSelectorTyped(state=>({
        selectedRepo:state.savedData.recentRepositories.find(x=>x.isSelected),
        refreshVersion:state.ui.versions.branchPanelRefresh,
    }),shallowEqual);

    const getRepoDetails=()=>{            
        window.ipcRenderer.send(RendererEvents.getRepositoryDetails().channel,store.selectedRepo);        
    }

    useEffect(()=>{               
        if(store.selectedRepo) {
            CacheUtils.getRepoDetails(store.selectedRepo.path).then(res=>{
                if(res) {
                    BranchUtils.repositoryDetails = res;
                    setState({repoDetails:res,selectedCommit:res.headCommit});
                    dispatch(ActionUI.increamentVersion("repoDetails"));
                }
                else getRepoDetails();
            });
        }
        else getRepoDetails();

        

    },[store.selectedRepo]);

    useEffect(()=>{
        if(state.repoDetails){
            UiUtils.updateHeadCommit = (commitInfo:ICommitInfo)=>{
                BranchUtils.repositoryDetails.headCommit.isHead=false;
                let elemOfOldCheck = document.getElementById(`${EnumIdPrefix.COMMIT_TEXT}${BranchUtils.repositoryDetails.headCommit.hash}`);
                if(elemOfOldCheck){
                    elemOfOldCheck.classList.add('d-none');
                }
                const newHead = BranchUtils.repositoryDetails.allCommits.find(x=>x.hash === commitInfo.hash)!;
                newHead.isHead = true;
                BranchUtils.repositoryDetails.headCommit = newHead;
                console.log("BranchUtils.repositoryDetails",BranchUtils.repositoryDetails);
                
                let elem = document.getElementById(`${EnumIdPrefix.COMMIT_TEXT}${newHead.hash}`);
                if(elem){
                    elem.classList.remove("d-none");
                }
                CacheUtils.setRepoDetails(BranchUtils.repositoryDetails);
                setState({selectedCommit:newHead});
            }
        }
        
    },[state.repoDetails])

    useEffect(()=>{
        if(!store.refreshVersion) return;
        setState({repoDetails:undefined});
        getRepoDetails();
    },[store.refreshVersion]);

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.getRepositoryDetails().replyChannel,(e,res:IRepositoryDetails)=>{
            BranchUtils.getRepoDetails(res);
            BranchUtils.repositoryDetails = res;        
            CacheUtils.setRepoDetails(res);
            setState({repoDetails:res,selectedCommit:res.headCommit});            
            dispatch(ActionUI.increamentVersion("repoDetails"));
            
        });

        window.ipcRenderer.on(RendererEvents.refreshBranchPanel().channel,(_e)=>{
            getRepoDetails();
        })

        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getRepositoryDetails().replyChannel]);
            UiUtils.removeIpcListeners([RendererEvents.refreshBranchPanel().channel]);
        }
    },[]);
    
    return <div className="d-flex w-100 h-100">
        {props.selectedTab === "Changes" && <Changes repoInfo={state.repoDetails?.repoInfo} />}
        {props.selectedTab === "Branches" && <BranchesView onCommitSelect ={c=>setState({selectedCommit:c})} repoDetails={state.repoDetails} 
        selectedCommit={state.selectedCommit}   />}
    </div>    
}

export const SelectedRepoRight = React.memo(SelectedRepoRightComponent);