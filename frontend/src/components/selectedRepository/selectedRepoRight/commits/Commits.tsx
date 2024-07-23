import React, { Fragment, useCallback, useEffect, useMemo, useRef } from "react"
import { EnumHtmlIds, UiUtils, useDrag, useMultiState } from "../../../../lib";
import { CommitFilter } from "./CommitFilter";
import { CommitList } from "./CommitList";
import { ICommitInfo } from "common_library";
import { CommitProperty } from "../branches/CommitProperty";
import { CommitChangeView } from "../branches/CommitChangeView";
import { ModalData } from "../../../modals/ModalData";

interface IRefData{
    selectedCommit?:ICommitInfo;
}

interface IState{
    searchText:string;
    selectedBranch?:string;
    selectedCommit?:ICommitInfo;
}

function CommitsComponent(){    

    const [state,setState]=useMultiState<IState>({                
        searchText:"",
    });
    
    const refData = useRef<IRefData>({});

    const handleSearch = (text:string)=>{
        setState({searchText:text});
    }

    useEffect(()=>{
        refData.current.selectedCommit = state.selectedCommit;
    },[state.selectedCommit]);

    const handleSelect = useCallback((commit:ICommitInfo)=>{
        if(commit?.hash === refData.current.selectedCommit?.hash){
            setState({selectedCommit:null!});
        }
        else{
            setState({selectedCommit:commit});
        }
    },[]);
    
    const handleRightClick = useCallback((commit:ICommitInfo)=>{
        if(commit?.hash === refData.current.selectedCommit?.hash){
            setState({selectedCommit:null!});
        }
        else{
            setState({selectedCommit:commit});
        }
    },[]);

    const handleContext = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>,commit:ICommitInfo)=>{
        ModalData.commitContextModal.selectedCommit=commit!;            
        ModalData.commitContextModal.position = {
            x:e.clientX,
            y:e.clientY,
        };
        UiUtils.openContextModal();
    },[]);
    
    const bottomHeightRef = useRef(200);
    const positionRef = useRef(0);
    
    const {currentMousePosition:position,elementRef:resizer} = useDrag();

    const bottomHeight = useMemo(()=>{
        if(!state.selectedCommit)
            return -3;
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
    },[position?.y,state.selectedCommit])

    return <div className="h-100 w-100">
        <div className="w-100" style={{height:'10%'}}>
            <CommitFilter onSearch={handleSearch} onBranchSelect={br=>setState({selectedBranch:br})} />
        </div>
        <div className="w-100" style={{height:'90%'}}>
            <div className="d-flex w-100 overflow-hidden" style={{height:`calc(100% - ${bottomHeight+3}px)`}}>
                <div className="w-75 h-100">
                    <CommitList searchText={state.searchText} selectedBranch={state.selectedBranch}
                     onCommitSelect={handleSelect} selectedCommit={state.selectedCommit} onRightClick={handleContext} />
                </div>
                <div className="w-25">
                    {!!state.selectedCommit && <CommitProperty selectedCommit={state.selectedCommit}  />}
                </div>
            </div>
            {!!state.selectedCommit && <Fragment>
                <div ref={resizer as any} className="bg-second-color cur-resize-v" style={{ height: '3px' }} />
                <div className="w-100" style={{height:`${bottomHeight}px`}}>
                    {!!state.selectedCommit && <CommitChangeView selectedCommit={state.selectedCommit} containerId={EnumHtmlIds.CommitDiffFromList} />}
                </div>
            </Fragment>}
            
        </div>
        
    </div>
}

export const Commits = React.memo(CommitsComponent);