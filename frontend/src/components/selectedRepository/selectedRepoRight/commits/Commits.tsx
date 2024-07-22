import React, { useCallback, useMemo, useRef } from "react"
import { EnumHtmlIds, useDrag, useMultiState } from "../../../../lib";
import { CommitFilter } from "./CommitFilter";
import { CommitList } from "./CommitList";
import { ICommitInfo } from "common_library";
import { CommitProperty } from "../branches/CommitProperty";
import { CommitChangeView } from "../branches/CommitChangeView";

interface IState{
    searchText:string;
    selectedBranch?:string;
    selectedCommit?:ICommitInfo;
}

function CommitsComponent(){    

    const [state,setState]=useMultiState<IState>({                
        searchText:"",
    });   

    const handleSearch = (text:string)=>{
        setState({searchText:text});
    }

    const handleSelect = useCallback((commit:ICommitInfo)=>{
        setState({selectedCommit:commit});
    },[]);
    
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

    return <div className="h-100 w-100">
        <div className="w-100" style={{height:'10%'}}>
            <CommitFilter onSearch={handleSearch} onBranchSelect={br=>setState({selectedBranch:br})} />
        </div>
        <div className="w-100 h-100">
            <div className="d-flex w-100 overflow-hidden" style={{height:`calc(100% - ${bottomHeight+3}px)`}}>
                <div className="w-75 h-100">
                    <CommitList searchText={state.searchText} selectedBranch={state.selectedBranch}
                     onCommitSelect={handleSelect} selectedCommit={state.selectedCommit} />
                </div>
                <div className="w-25">
                    {!!state.selectedCommit && <CommitProperty selectedCommit={state.selectedCommit}  />}
                </div>
            </div>
            <div ref={resizer as any} className="bg-second-color cur-resize-v" style={{ height: '3px' }} />
            <div className="w-100" style={{height:`${bottomHeight}px`}}>
                {!!state.selectedCommit && <CommitChangeView selectedCommit={state.selectedCommit} containerId={EnumHtmlIds.CommitDiffFromList} />}
            </div>
        </div>
        
    </div>
}

export const Commits = React.memo(CommitsComponent);