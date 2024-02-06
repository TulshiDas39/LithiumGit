import { EditorColors, ILine } from "../../../../lib"
import { DiffView } from "./DiffView";

interface IProps{
    linesBeforeChange:ILine[];
    linesAfterChange:ILine[];
}

export function Difference2(props:IProps){
    return <div className="d-flex w-100 h-100 gs-overflow-y-auto">
        {!!props.linesBeforeChange && <div>
            <DiffView color={EditorColors.line.previous} lines={props.linesBeforeChange} />
        </div>}
        <div>
            <DiffView color={EditorColors.line.current} lines={props.linesAfterChange} />
        </div>
    </div>
}