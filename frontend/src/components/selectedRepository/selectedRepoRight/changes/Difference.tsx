import { EditorColors, ILine } from "../../../../lib"
import { DiffView } from "./DiffView";

interface IProps{
    linesBeforeChange:ILine[];
    linesAfterChange:ILine[];
}

export function Difference(props:IProps){
    return <div className="d-flex w-100 h-100 difference" style={{overflowY:'auto'}}>
        {!!props.linesBeforeChange && <div className={`w-${!!props.linesAfterChange?"50":"100"} previous `}>
            <DiffView color={EditorColors.line.previous} lines={props.linesBeforeChange} />
        </div>}
        {!!props.linesAfterChange && <div className={`w-${!!props.linesBeforeChange?"50":"100"} ps-2 current`}>
            <DiffView color={EditorColors.line.current} lines={props.linesAfterChange} />
        </div>}
    </div>
}