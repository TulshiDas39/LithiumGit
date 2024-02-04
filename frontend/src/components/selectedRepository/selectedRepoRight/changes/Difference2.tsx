import React from "react"
import { EditorColors, ILine } from "../../../../lib"
import { DiffView } from "./DiffView";

interface IProps{
    linesBeforeChange:ILine[];
    linesAfterChange:ILine[];
}

function DifferenceComponent(props:IProps){
    return <div className="d-flex w-100 h-100 gs-overflow-y-auto">
        {!!props.linesBeforeChange && <div>
            <DiffView color={EditorColors.line.previous} lines={props.linesBeforeChange} />
        </div>}
        <div>
            <DiffView color={EditorColors.line.current} lines={props.linesAfterChange} />
        </div>
    </div>
}

export const Difference2 = React.memo(DifferenceComponent)