import { ILine } from "../../../../lib"
import { ConflictDiffView } from "./ConflictDiffView";

interface IProps{
    previousLines:ILine[];
    currentLines:ILine[];
    previousLineDivWidth:number;
    currentLineDivWidth:number;
}
export function ConflictTopPanel(props:IProps){    
    return <div className="d-flex w-100 h-100 conflict-diff" style={{overflowY:'auto'}}>
        <div className={`w-50 previous `}>
            <ConflictDiffView colorClass={"bg-previous-change"} lines={props.previousLines}
                lineDivWidth={props.previousLineDivWidth} />
        </div>

        <div className={`w-50 previous ps-2 current`}>
            <ConflictDiffView colorClass={"bg-current-change"} lines={props.currentLines}
                lineDivWidth={props.currentLineDivWidth} />
        </div>
    </div>
}