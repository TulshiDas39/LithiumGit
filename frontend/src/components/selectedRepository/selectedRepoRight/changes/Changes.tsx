import React, { Fragment, useRef } from "react"
import { FaAngleDown, FaAngleRight, FaPlus, FaUndo } from "react-icons/fa";
import { useMultiState } from "../../../../lib";
import { IChanges, ModifiedChanges } from "./ModifiedChanges";
import { IStagedChanges, StagedChanges } from "./StagedChanges";

interface IState {
    adjustedX: number;    
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
        modifiedChanges: demoChanges,
        stagedChanges:demoStagedChanges,
    });
    const dragData = useRef({ initialX: 0, currentX: 0 });

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


    console.log(dragData.current);

    return <div className="d-flex w-100">
        <div className="pe-2" style={{ width: `calc(20% ${getAdjustedSize(state.adjustedX)})` }}>
            {
                !!state.stagedChanges &&
                <StagedChanges stagedChanges={demoStagedChanges} />
            }

            {!!state.modifiedChanges &&
                <ModifiedChanges modifiedChanges={state.modifiedChanges} />}
        </div>
        <div className="bg-info cur-resize" onDrag={handleResize} style={{ width: '3px',zIndex:2 }} />

        <div className="ps-2 bg-white" style={{ width: `calc(80% - 3px ${getAdjustedSize(-state.adjustedX)})`,zIndex:2 }}>
            Changes
        </div>
    </div>
}

export const Changes = React.memo(ChangesComponent);