import { EnumConflictSide } from "common_library";
import { ILine } from "../../../../lib"
import { ConflictDiffView } from "./ConflictDiffView";

interface IProps{
    previousLines:ILine[];
    currentLines:ILine[];
    previousLineDivWidth:number;
    currentLineDivWidth:number;
}
export function ConflictTopPanel(props:IProps){    
    return <div className="d-flex w-100 h-100 conflict-diff">
        <div className={`w-50 h-100 previous `}>
            <ConflictDiffView colorClass={"bg-previous-change"} lines={props.previousLines}
                lineDivWidth={props.previousLineDivWidth} side={EnumConflictSide.Incoming} />
        </div>

        <div className={`w-50 h-100 ps-2 current`}>
            <ConflictDiffView colorClass={"bg-current-change"} lines={props.currentLines}
                lineDivWidth={props.currentLineDivWidth} side={EnumConflictSide.Current} />
        </div>
    </div>
}