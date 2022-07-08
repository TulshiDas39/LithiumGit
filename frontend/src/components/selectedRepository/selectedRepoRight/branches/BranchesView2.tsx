import { IRepositoryDetails } from "common_library";
import React, { useEffect, useRef } from "react"
import { useDispatch, shallowEqual } from "react-redux";
import { useMultiState } from "../../../../lib";
import { BranchGraphUtils } from "../../../../lib/utils/BranchGraphUtils";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { SelectedRepoRightData } from "../SelectedRepoRightData";
import { BranchActions } from "./BranchActions";
import { CommitProperty2 } from "./CommitProperty2";

interface IBranchesViewProps{
    // repoDetails?:IRepositoryDetails;    
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
                    BranchGraphUtils.insertNewBranchGraph();
                }
            }
        }
    },[branchPanelRef.current])    
    
    useEffect(()=>{        

        const handleRepoDetailsUpdate=(repoDetails:IRepositoryDetails)=>{
            setState({repoDetails});
        }
        SelectedRepoRightData.handleRepoDetailsUpdate = handleRepoDetailsUpdate;
        
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