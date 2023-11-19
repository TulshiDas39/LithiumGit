import React, { useEffect, useRef } from "react"
import { shallowEqual } from "react-redux";
import { EnumHtmlIds, EnumSelectedRepoTab } from "../../../../lib";
import { BranchGraphUtils } from "../../../../lib/utils/BranchGraphUtils";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { BranchActions } from "./BranchActions";
import { CommitProperty2 } from "./CommitProperty2";

function BranchesViewComponent(){    
    const store = useSelectorTyped(state=>({
        selectedRepo:state.savedData.recentRepositories.find(x=>x.isSelected),        
        branchPanelRefreshVersion:state.ui.versions.branchPanelRefresh,
        show:state.ui.selectedRepoTab === EnumSelectedRepoTab.BRANCHES,
    }),shallowEqual);


    useEffect(()=>{        
        if(!BranchGraphUtils.branchPanelHtml){            
            BranchGraphUtils.createBranchPanel();
        }
        return ()=>{
            BranchGraphUtils.focusedCommit = null!;
        }        
    },[]);

    return <div id="selectedRepoRight" className={`d-flex w-100 flex-column ${store.show?'':'d-none'}`}>
    <BranchActions />
    <div className="d-flex w-100 overflow-hidden">
        <div id={EnumHtmlIds.branchPanelContainer} className="w-75">
            {/* branch graph will be displayed here */}
        </div>
        <div className="w-25 ps-2">
             <CommitProperty2 />
        </div>
    </div>
</div>   
}

export const BranchesView2 = React.memo(BranchesViewComponent);