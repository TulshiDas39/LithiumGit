import { ICommitInfo, IRepositoryDetails, RendererEvents } from "common_library";
import React, { useEffect, useRef } from "react"
import { useDispatch, shallowEqual } from "react-redux";
import { BranchUtils, CacheUtils, EnumIdPrefix, UiUtils, useMultiState } from "../../../../lib";
import { BranchGraphUtils } from "../../../../lib/utils/BranchGraphUtils";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { ActionUI } from "../../../../store/slices/UiSlice";
import { SelectedRepoRightData } from "../SelectedRepoRightData";
import { BranchActions } from "./BranchActions";
import { CommitProperty2 } from "./CommitProperty2";

interface IBranchesViewProps{
    repoDetails?:IRepositoryDetails;    
    // onCommitSelect:(commit:ICommitInfo)=>void;
}

interface IState{
}

function BranchesViewComponent(props:IBranchesViewProps){
    const [state,setState]=useMultiState<IState>({
        
    })

    const dispatch = useDispatch();

    const store = useSelectorTyped(state=>({
        selectedRepo:state.savedData.recentRepositories.find(x=>x.isSelected),        
        branchPanelRefreshVersion:state.ui.versions.branchPanelRefresh,
    }),shallowEqual);

    const branchPanelRef = useRef<HTMLDivElement>();
    useEffect(()=>{
        if(branchPanelRef.current){
            const width = Math.floor(branchPanelRef.current.getBoundingClientRect().width);
            if(BranchGraphUtils.panelWidth !== width){
                const existingPanelWidth = BranchGraphUtils.panelWidth;
                BranchGraphUtils.panelWidth = width;
                if(existingPanelWidth === -1){
                    BranchGraphUtils.createBranchPanel();
                    branchPanelRef.current.appendChild(BranchGraphUtils.branchPanelRootElement);
                }
            }
                // setState({branchPanelWidth:width});
        }
    },[branchPanelRef.current])

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
        if(!store.branchPanelRefreshVersion) return;
        setState({repoDetails:undefined});
        getRepoDetails();
    },[store.branchPanelRefreshVersion]); 

    // useEffect(()=>{
        
    //     if(state.repoDetails){
    //         BranchUtils.repositoryDetails = state.repoDetails;
    //         UiUtils.updateHeadCommit = (commitInfo:ICommitInfo)=>{
    //             BranchUtils.repositoryDetails.headCommit.isHead=false;
    //             let elemOfOldCheck = document.getElementById(`${EnumIdPrefix.COMMIT_TEXT}${BranchUtils.repositoryDetails.headCommit.hash}`);
    //             if(elemOfOldCheck){
    //                 elemOfOldCheck.classList.add('d-none');
    //             }
    //             const newHead = BranchUtils.repositoryDetails.allCommits.find(x=>x.hash === commitInfo.hash)!;
    //             newHead.isHead = true;
    //             BranchUtils.repositoryDetails.headCommit = newHead;
    //             console.log("BranchUtils.repositoryDetails",BranchUtils.repositoryDetails);
                
    //             let elem = document.getElementById(`${EnumIdPrefix.COMMIT_TEXT}${newHead.hash}`);
    //             if(elem){
    //                 elem.classList.remove("d-none");
    //             }
    //             CacheUtils.setRepoDetails(BranchUtils.repositoryDetails);
    //             setState({selectedCommit:newHead});
    //         }
    //     }
        
    // },[state.repoDetails])
    
    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.getRepositoryDetails().replyChannel,(e,res:IRepositoryDetails)=>{
            BranchUtils.getRepoDetails(res);
            BranchUtils.repositoryDetails = res;        
            CacheUtils.setRepoDetails(res);
            setState({repoDetails:res,selectedCommit:res.headCommit});            
            //dispatch(ActionUI.increamentVersion("repoDetails"));
            
        });

        window.ipcRenderer.on(RendererEvents.refreshBranchPanel().channel,(_e)=>{
            getRepoDetails();
        })

        const handleRepoDetailsUpdate=(repoDetails:IRepositoryDetails)=>{
            setState({repoDetails});
        }

        SelectedRepoRightData.handleRepoDetailsUpdate = handleRepoDetailsUpdate;


        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getRepositoryDetails().replyChannel]);
            UiUtils.removeIpcListeners([RendererEvents.refreshBranchPanel().channel]);
        }
    },[]);

    return <div id="selectedRepoRight" className="d-flex w-100 flex-column">
    <BranchActions />
    <div className="d-flex w-100 overflow-hidden">
        <div id={BranchGraphUtils.branchPanelContainerId} ref={branchPanelRef as any} className="w-75">
            {/* {state.branchPanelWidth !== -1 && <BranchPanel2 containerWidth={state.branchPanelWidth-10} />} */}
        </div>
        <div className="w-25 ps-2">
             <CommitProperty2 />
        </div>
    </div>
</div>   
}

export const BranchesView2 = React.memo(BranchesViewComponent);