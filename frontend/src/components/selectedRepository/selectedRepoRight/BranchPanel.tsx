import { IRepositoryDetails, RendererEvents } from "common_library";
import React from "react"
import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { BranchUtils, UiUtils, useMultiState } from "../../../lib";
import { useSelectorTyped } from "../../../store/rootReducer";
import { SingleBranch } from "./SingleBranch";
interface IState{
    repoDetails:IRepositoryDetails;
}

function BranchPanelComponent(){
    const store = useSelectorTyped(state=>({
        selectedRepo:state.savedData.recentRepositories.find(x=>x.isSelected),
    }),shallowEqual);

    const [state,setState] = useMultiState<IState>({repoDetails:null!});
    
    useEffect(()=>{
        window.ipcRenderer.send(RendererEvents.getRepositoryDetails().channel,store.selectedRepo);
        window.ipcRenderer.on(RendererEvents.getRepositoryDetails().replyChannel,(e,res:IRepositoryDetails)=>{
            BranchUtils.getRepoDetails(res);
            setState({repoDetails:res});
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.getRepositoryDetails().replyChannel]);
        }
    },[]);

    if(!state.repoDetails) return <span>Loading...</span>;
    console.log(state.repoDetails);
    return <div className="d-flex w-100 overflow-auto">
            <svg width={state.repoDetails.branchPanelWidth} height={state.repoDetails.branchPanelHeight}>
                <g>
                    {
                        state.repoDetails.resolvedBranches.map(branch=>(
                            <SingleBranch key={branch._id} branchDetails ={branch} />
                        ))
                    }
                    {/* <path d="M100,100 h200" fill="none" stroke="black" stroke-width="2"/>
                    <path d="M100,100 v100 a20,20 0 0 0 20,20 h200" fill="none" stroke="black" stroke-width="2"/>
                    <path d="M100,100 v130 a20,20 0 0 0 20,20 h200" fill="none" stroke="black" stroke-width="2"/>
                    <circle cx="130" cy="250" r="13" stroke="black" stroke-width="3" fill="red" />
                    <circle cx="180" cy="250" r="13" stroke="black" stroke-width="3" fill="red" /> */}

                    {/* <path d="M100,100 h200 a20,20 0 0 1 20,20 v200 a20,20 0 0 1 -20,20 h-200 a20,20 0 0 1 -20,-20 v-200 a20,20 0 0 1 20,-20 z" fill="none" stroke="black" stroke-width="3" /> */}
                    {/* <path d="M100,120 h200 a20,20 0 0 1 20,20 v200 a20,20 0 0 1 -20,20 h-200 a20,20 0 0 1 -20,-20 v-200 a20,20 0 0 1 20,-20 z" fill="none" stroke="black" stroke-width="3" /> */}
                </g>
            </svg>
    </div>
}

export const BranchPanel = React.memo(BranchPanelComponent);