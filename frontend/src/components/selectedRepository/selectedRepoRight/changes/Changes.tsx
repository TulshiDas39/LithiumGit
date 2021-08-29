import React, { Fragment, useRef } from "react"
import { FaAngleDown, FaAngleRight, FaPlus, FaUndo } from "react-icons/fa";
import { useMultiState } from "../../../../lib";
import { IStagedChanges, StagedChanges } from "./StagedChanges";

interface IModifiedFile {
    fileName: string;
    path: string;
}

interface IChanges {
    modifiedFiles: IModifiedFile[];
}

interface IState {
    adjustedX: number;
    isStagedChangesExpanded: boolean;
    isChangesExpanded: boolean;
    stagedChanges?: IStagedChanges;
    modifiedChanges?: IChanges;
}

const demoStagedChanges: IStagedChanges = {
    stagedFiles: [
        {
            fileName: "file 1",
            path: "folder1/folder11/folder12"
        },
        {
            fileName: "file 2",
            path: "folder2/folder21/folder23"
        },
        {
            fileName: "file 3",
            path: "folder3/folder31/folder32"
        },
        {
            fileName: "file 4",
            path: "folder4/folder41/folder42"
        }
    ]
}

const demoChanges: IChanges = {
    modifiedFiles: [
        {
            fileName: "file 1",
            path: "folder1/folder11/folder12"
        },
        {
            fileName: "file 2",
            path: "folder2/folder21/folder23"
        },
        {
            fileName: "file 3",
            path: "folder3/folder31/folder32"
        },
        {
            fileName: "file 4",
            path: "folder4/folder41/folder42"
        }
    ]
}

function ChangesComponent() {
    const [state, setState] = useMultiState<IState>({
        adjustedX: 0,
        isStagedChangesExpanded: true,
        isChangesExpanded: true,
        modifiedChanges: demoChanges,
        stagedChanges:demoStagedChanges,
    });
    const dragData = useRef({ initialX: 0, currentX: 0 });
    // useEffect(()=>{
    //     initialDragData.current.clientX
    // },[])
    const setAdjustedX = () => {
        setState({ adjustedX: dragData.current.currentX - dragData.current.initialX });
    }
    const handleResize = (e: React.DragEvent<HTMLDivElement>) => {
        console.log(e);
        if (dragData.current.initialX === 0) dragData.current.initialX = e.screenX;
        if (e.screenX !== 0) dragData.current.currentX = e.screenX;
        setAdjustedX();
    }
    const getAdjustedSize = (adjustedX: number) => {
        if (adjustedX > 0) return `+ ${adjustedX}px`;
        return `- ${-adjustedX}px`;
    }

    const handleChangesCollapse = () => {
        setState({ isChangesExpanded: !state.isChangesExpanded });
    }

    console.log(dragData.current);

    return <div className="d-flex w-100">
        <div className="pe-2" style={{ width: `calc(20% ${getAdjustedSize(state.adjustedX)})` }}>
            {
                !!state.stagedChanges &&
                <StagedChanges stagedChanges={demoStagedChanges} />
            }

            {!!state.modifiedChanges &&
                <Fragment>
                <div className="d-flex hover" onClick={handleChangesCollapse}>
                    <span>{state.isChangesExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
                    <span>Changes</span>
                </div>
                {state.isChangesExpanded && 
                    <div className="d-flex flex-column ps-2">
                        {state.modifiedChanges.modifiedFiles.map(f=>(
                            <div className="d-flex align-items-center flex-nowrap position-relative">
                                <span className="pe-1 flex-shrink-0">{f.fileName}</span>
                                <span className="small text-secondary">{f.path}</span>
                                <div className="position-absolute d-flex bg-white ps-2" style={{ right: 0 }}>
                                    <span className="hover" title="discard"><FaUndo /></span>
                                    <span className="px-1" />
                                    <span className="hover"><FaPlus /></span>
                                </div>
                            </div>
                        ))}                                                
                    </div>
                }
            </Fragment>}
        </div>
        <div className="bg-info cur-resize" onDrag={handleResize} style={{ width: '3px' }}>

        </div>
        <div className="ps-2" style={{ width: `calc(80% - 3px ${getAdjustedSize(-state.adjustedX)})` }}>
            Changes
        </div>
    </div>
}

export const Changes = React.memo(ChangesComponent);