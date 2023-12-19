import React, { useEffect } from "react"
import { shallowEqual } from "react-redux";
import { EnumHtmlIds, EnumSelectedRepoTab } from "../../../../lib";
import { BranchGraphUtils } from "../../../../lib/utils/BranchGraphUtils";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { BranchActions } from "./BranchActions";
import { CommitProperty } from "./CommitProperty";

function BranchesViewComponent() {
    const store = useSelectorTyped(state => ({
        selectedRepo: state.savedData.recentRepositories.find(x => x.isSelected),
        branchPanelRefreshVersion: state.ui.versions.branchPanelRefresh,
        show: state.ui.selectedRepoTab === EnumSelectedRepoTab.BRANCHES,
    }), shallowEqual);


    const resetGraphStates=()=>{
        BranchGraphUtils.state.panelHeight.publish(0);
        BranchGraphUtils.state.svgContainerWidth.publish(0);
    }

    useEffect(() => {
        BranchGraphUtils.createBranchPanel();
        return ()=>{
            resetGraphStates();
        }
    }, []);


    return <div id="selectedRepoRight" className={`d-flex w-100 flex-column ${store.show ? '' : 'd-none'}`}>
        <BranchActions />
        <div className="d-flex w-100 overflow-hidden" style={{height:`70%`}}>
            <div id={EnumHtmlIds.branchPanelContainer} className="invisible" style={{width:`75%`}}>
                <div id={EnumHtmlIds.branchPanel} className="w-100 d-flex align-items-stretch" style={{ height:`calc(100% - ${BranchGraphUtils.scrollBarSize}px)`, overflow: 'hidden' }}>
                    <div id={EnumHtmlIds.branchSvgContainer} className="" style={{width: `calc(100% - ${BranchGraphUtils.scrollBarSize}px)`}}>
                        {/* branch graph will be displayed here */}
                    </div>
                    <div className="d-flex bg-secondary position-relative" style={{width:`${BranchGraphUtils.scrollBarSize}px`}}>
                        <div id={EnumHtmlIds.branchVerticalScrollBar} className="bg-danger position-absolute w-100" style={{height:`0px`,top:0,left:0}}> </div>
                    </div>                    
                </div>
                <div className="d-flex bg-secondary w-100 position-relative" style={{height:`${BranchGraphUtils.scrollBarSize}px`}}>
                    <div id={EnumHtmlIds.branchHorizontalScrollBar} className="position-absolute bg-danger h-100" style={{width:`0px`, left:0,top:0}}></div>
                </div> 
            </div>
            <div className="w-25 ps-2">
                <CommitProperty />
            </div>
        </div>
    </div>
}

export const BranchesView = React.memo(BranchesViewComponent);