import React, { useEffect, useRef } from "react"
import { shallowEqual } from "react-redux";
import { EnumHtmlIds, EnumSelectedRepoTab } from "../../../../lib";
import { BranchGraphUtils } from "../../../../lib/utils/BranchGraphUtils";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { BranchActions } from "./BranchActions";
import { CommitProperty2 } from "./CommitProperty2";

function BranchesViewComponent() {
    const store = useSelectorTyped(state => ({
        selectedRepo: state.savedData.recentRepositories.find(x => x.isSelected),
        branchPanelRefreshVersion: state.ui.versions.branchPanelRefresh,
        show: state.ui.selectedRepoTab === EnumSelectedRepoTab.BRANCHES,
    }), shallowEqual);


    useEffect(() => {
        if (!BranchGraphUtils.branchSvgHtml) {
            BranchGraphUtils.createBranchPanel();
        }
        return () => {
            BranchGraphUtils.focusedCommit = null!;
        }
    }, []);


    return <div id="selectedRepoRight" className={`d-flex w-100 flex-column ${store.show ? '' : 'd-none'}`}>
        <BranchActions />
        <div className="d-flex w-100 overflow-hidden">
            <div id={EnumHtmlIds.branchPanelContainer} className="w-75 invisible">
                <div id={EnumHtmlIds.branchPanel} className="w-100 d-flex align-items-stretch" style={{ overflow: 'hidden' }}>
                    <div id={EnumHtmlIds.branchSvgContainer} className="" style={{width:`calc(100% - ${BranchGraphUtils.verticalScrollBarWidth}px)`}}>
                        {/* branch graph will be displayed here */}
                    </div>
                    <div className="d-flex bg-secondary position-relative" style={{width:`${BranchGraphUtils.verticalScrollBarWidth}px`}}>
                        <div id={EnumHtmlIds.branchVerticalScrollBar} className="bg-danger position-absolute w-100" style={{height:`0px`,top:0,left:0}}> </div>
                    </div>                    
                </div>
                <div className="d-flex bg-secondary py-2 w-100 position-relative">
                    <div id={EnumHtmlIds.branchHorizontalScrollBar} className="position-absolute bg-danger h-100" style={{width:`0px`, left:0,top:0}}></div>
                </div> 
            </div>
            <div className="w-25 ps-2">
                <CommitProperty2 />
            </div>
        </div>
    </div>
}

export const BranchesView2 = React.memo(BranchesViewComponent);