import React, { Fragment, useCallback, useEffect, useMemo, useRef } from "react"
import { EnumHtmlIds, EnumModals, UiUtils, useDrag, useMultiState } from "../../../../lib";
import { CommitFilter } from "./CommitFilter";
import { CommitList } from "./CommitList";
import { ICommitInfo } from "common_library";
import { CommitProperty } from "../branches/CommitProperty";
import { CommitChangeView } from "../branches/CommitChangeView";
import { ModalData } from "../../../modals/ModalData";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual } from "react-redux";

interface IProps{
    show:boolean;
}

interface IRefData{
    selectedCommit?:ICommitInfo;
}

interface IState{
    searchText:string;
    selectedBranch?:string;
    selectedCommit?:ICommitInfo;
    contextCommit?:ICommitInfo;
}

function CommitsComponent(props:IProps){
    const store = useSelectorTyped((state)=>({
        contextVisible:state.modal.openedModals.includes(EnumModals.COMMIT_CONTEXT),
    }),shallowEqual);

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

    const handleContext = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>,commit:ICommitInfo)=>{
        ModalData.commitContextModal.selectedCommit=commit!;            
        ModalData.commitContextModal.position = {
            x:e.clientX,
            y:e.clientY,
        };
        UiUtils.openCommitContextModal();
        setState({contextCommit:commit});
    },[]);
    
    const bottomHeightRef = useRef(200);
    const prevBottomHeightRef = useRef(bottomHeightRef.current);
    const positionRef = useRef(0);
    const commitListRef = useRef<HTMLDivElement>();
    
    const {currentMousePosition:position,elementRef:resizer} = useDrag();
    console.log("rendering.");
    const bottomHeight = useMemo(()=>{
        if(!state.selectedCommit)
            return -3;
        const curHeight = bottomHeightRef.current - positionRef.current;
        const height = Math.max(50, curHeight);
        if(!position){
            bottomHeightRef.current = prevBottomHeightRef.current;
            positionRef.current = 0;
        }
        else{
            positionRef.current = position.y;
        }
        
        const graphViewHeight = commitListRef.current?.getBoundingClientRect().height;
        if(!!graphViewHeight && graphViewHeight <= 100 && curHeight > prevBottomHeightRef.current){
            return prevBottomHeightRef.current;
        }
        return height;
    },[position?.y,state.selectedCommit])

    useEffect(()=>{
        if(!state.selectedCommit)
            return;
        prevBottomHeightRef.current = bottomHeight;
    },[bottomHeight,state.selectedCommit]);

    useEffect(()=>{        
        if(!store.contextVisible && !!state.contextCommit){
            setState({contextCommit:undefined});
        }
    },[store.contextVisible])

    return <div className={`h-100 w-100 ${props.show?"":"d-none"}`} style={{backgroundColor:"var(--bg-color)"}}>
        <div className="w-100" style={{height:'10%'}}>
            <CommitFilter onSearch={handleSearch} onBranchSelect={br=>setState({selectedBranch:br})} />
        </div>
        <div className="w-100" style={{height:'90%'}}>
            <div ref={commitListRef as any} className="d-flex w-100 overflow-hidden" style={{height:`calc(100% - ${bottomHeight+3}px)`}}>
                <div className="w-75 h-100">
                    <CommitList searchText={state.searchText} selectedBranch={state.selectedBranch}
                     onCommitSelect={handleSelect} selectedCommit={state.selectedCommit} contextCommit={state.contextCommit} onRightClick={handleContext} />
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