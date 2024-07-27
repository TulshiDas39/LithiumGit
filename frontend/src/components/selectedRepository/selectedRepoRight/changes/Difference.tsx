import { EditorColors, ILine } from "../../../../lib"
import { DiffView } from "./DiffView";

interface IProps{
    linesBeforeChange:ILine[];
    linesAfterChange:ILine[];
}

export function Difference(props:IProps){
    return <div className="d-flex w-100 h-100 difference" style={{overflowY:'hidden'}}>
        {!!props.linesBeforeChange && <div className={`h-100 w-${!!props.linesAfterChange?"50":"100"} previous `}>
            <DiffView changeType="previous" lines={props.linesBeforeChange} />
        </div>}
        {!!props.linesAfterChange && <div className={`h-100 w-${!!props.linesBeforeChange?"50":"100"} ps-2 current`}>
            <DiffView changeType="current" lines={props.linesAfterChange} />
        </div>}
    </div>
}