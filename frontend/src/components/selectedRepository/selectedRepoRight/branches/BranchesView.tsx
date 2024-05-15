import React, { useEffect, useMemo, useRef } from "react"
import { shallowEqual } from "react-redux";
import { EnumHtmlIds, EnumSelectedRepoTab, useDrag } from "../../../../lib";
import { GraphUtils } from "../../../../lib/utils/GraphUtils";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { BranchActions } from "./BranchActions";
import { CommitProperty } from "./CommitProperty";
import { CommitChangeView } from "./CommitChangeView";
import { ChangeUtils } from "../../../../lib/utils/ChangeUtils";

function BranchesViewComponent() {
    const store = useSelectorTyped(state => ({
        show: state.ui.selectedRepoTab === EnumSelectedRepoTab.GRAPH,
    }), shallowEqual);

    useEffect(()=>{
        if(GraphUtils.svgElement)
            GraphUtils.updateUi();
    },[store.show])

    const bottomHeightRef = useRef(200);
    const positionRef = useRef(0);
    const {currentMousePosition:position,elementRef:resizer} = useDrag();

    const bottomHeight = useMemo(()=>{
        const curHeight = bottomHeightRef.current - positionRef.current;
        const height = Math.max(50, curHeight);
        if(!position){
            bottomHeightRef.current = height;
            positionRef.current = 0;
        }
        else{
            positionRef.current = position.y;
        }
        return height;
    },[position?.y])

    useEffect(()=>{        
        return ()=>{
            window.removeEventListener("resize",GraphUtils.resizeHandler);    
        }
    },[])

    useEffect(()=>{
        if(!GraphUtils.svgContainer)
            return;
        GraphUtils.resizeHandler();
    },[bottomHeight])

    return <div id="selectedRepoRight" className={`d-flex w-100 flex-column ${store.show ? '' : 'd-none'}`}>
        <div className="d-flex flex-column" style={{height:`calc(100% - ${bottomHeight+3}px)`}}>
            <BranchActions />
            <div className="d-flex w-100 overflow-hidden" style={{height:`calc(100% - 30px)`}}>
                <div id={EnumHtmlIds.branchPanelContainer} className="overflow-hidden" style={{width:`75%`}}>
                    <div id={EnumHtmlIds.branchPanel} className="w-100 d-flex align-items-stretch" style={{ height:`calc(100% - ${GraphUtils.scrollBarSize}px)`, overflow: 'hidden' }}>
                        <div id={EnumHtmlIds.branchSvgContainer} className="" style={{width: `calc(100% - ${GraphUtils.scrollBarSize}px)`}}>
                            <p className="text-center">Loading...</p>
                            {/* branch graph will be displayed here */}
                        </div>
                        <div className="d-flex bg-secondary position-relative" style={{width:`${GraphUtils.scrollBarSize}px`}}>
                            <div id={EnumHtmlIds.branchVerticalScrollBar} className="bg-danger position-absolute w-100" style={{height:`0px`,top:0,left:0}}> </div>
                        </div>                    
                    </div>
                    <div className="d-flex bg-secondary w-100 position-relative" style={{height:`${GraphUtils.scrollBarSize}px`}}>
                        <div id={EnumHtmlIds.branchHorizontalScrollBar} className="position-absolute bg-danger h-100" style={{width:`0px`, left:0,top:0}}></div>
                    </div> 
                </div>
                <div className="w-25 ps-2">
                    <CommitProperty />
                </div>
            </div>
        </div>        
        <div ref={resizer as any} className="bg-second-color cur-resize-v" style={{ height: '3px' }} />
        <div className="w-100" style={{height:`${bottomHeight}px`}}>
            <CommitChangeView />
        </div>

    </div>
}

export const BranchesView = React.memo(BranchesViewComponent);