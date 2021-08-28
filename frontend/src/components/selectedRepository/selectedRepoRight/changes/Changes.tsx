import React, { useRef } from "react"
import { FaAngleDown, FaAngleRight, FaAngleUp, FaArrowDown } from "react-icons/fa";
import { useMultiState } from "../../../../lib";

interface IState{
    adjustedX:number;
    isStagedChangesExpanded:boolean;
    isChangesExpanded:boolean;
}

function ChangesComponent(){
    const [state,setState] = useMultiState<IState>({adjustedX:0,
        isStagedChangesExpanded:true,
        isChangesExpanded:true,
    });
    const dragData = useRef({initialX:0,currentX:0});
    // useEffect(()=>{
    //     initialDragData.current.clientX
    // },[])
    const setAdjustedX=()=>{
        setState({adjustedX:dragData.current.currentX - dragData.current.initialX});
    }
    const handleResize = (e: React.DragEvent<HTMLDivElement>)=>{
        console.log(e);
        if(dragData.current.initialX === 0) dragData.current.initialX = e.screenX;
        if(e.screenX !== 0) dragData.current.currentX = e.screenX;
        setAdjustedX();
    }
    const getAdjustedSize=(adjustedX:number)=>{
        if(adjustedX > 0) return `+ ${adjustedX}px`;
        return `- ${-adjustedX}px`;
    }

    const handleStageCollapse = ()=>{
        setState({isStagedChangesExpanded:!state.isStagedChangesExpanded});
    }

    const handleChangesCollapse = ()=>{
        setState({isChangesExpanded:!state.isChangesExpanded});
    }

    console.log(dragData.current);

    return <div className="d-flex w-100">
        <div className="pe-2" style={{width:`calc(20% ${getAdjustedSize(state.adjustedX)})`}}>
            <div className="d-flex hover" onClick={handleStageCollapse}>
                <span>{state.isStagedChangesExpanded ? <FaAngleDown />:<FaAngleRight />} </span>
                <span>Staged Changes</span>
            </div>
            {state.isStagedChangesExpanded && <div className="d-flex flex-column ps-2">
                <div className="d-flex align-items-center flex-nowrap">
                    <span className="pe-1 flex-shrink-0">File Name 1</span>
                    <span className="small text-secondary">test/test/test</span>
                </div>
                <div className="d-flex align-items-center flex-nowrap">
                    <span className="pe-1 flex-shrink-0">File Name 1</span>
                    <span className="small text-secondary">test/test/test</span>
                </div>
                <div className="d-flex align-items-center flex-nowrap">
                    <span className="pe-1 flex-shrink-0">File Name 1</span>
                    <span className="small text-secondary">test/test/test</span>
                </div>
                <div className="d-flex align-items-center flex-nowrap">
                    <span className="pe-1 flex-shrink-0">File Name 1</span>
                    <span className="small text-secondary">test/test/test</span>
                </div>
            </div>
            }          

            <div className="d-flex hover" onClick={handleChangesCollapse}>
                <span>{state.isChangesExpanded ? <FaAngleDown />:<FaAngleRight />} </span>
                <span>Changes</span>
            </div>
            {state.isChangesExpanded && <div className="d-flex flex-column ps-2">
                <div className="d-flex align-items-center flex-nowrap">
                    <span className="pe-1 flex-shrink-0">File Name 1</span>
                    <span className="small text-secondary">test/test/test</span>
                </div>
                <div className="d-flex align-items-center flex-nowrap">
                    <span className="pe-1 flex-shrink-0">File Name 1</span>
                    <span className="small text-secondary">test/test/test</span>
                </div>
                <div className="d-flex align-items-center flex-nowrap">
                    <span className="pe-1 flex-shrink-0">File Name 1</span>
                    <span className="small text-secondary">test/test/test</span>
                </div>
                <div className="d-flex align-items-center flex-nowrap">
                    <span className="pe-1 flex-shrink-0">File Name 1</span>
                    <span className="small text-secondary">test/test/test</span>
                </div>
            </div>
            }
        </div>
        <div className="bg-info cur-resize" onDrag={handleResize} style={{width:'3px'}}>

        </div>
        <div className="ps-2" style={{width:`calc(80% - 3px ${getAdjustedSize(-state.adjustedX)})`}}>
            Changes
        </div>
    </div>
}

export const Changes = React.memo(ChangesComponent);