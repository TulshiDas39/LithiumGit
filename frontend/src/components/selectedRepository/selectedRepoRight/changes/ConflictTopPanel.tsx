import { EditorColors, ILine } from "../../../../lib"
import { ConflictDiffView } from "./ConflictDiffView";

interface IProps{
    previousLines:ILine[];
    currentLines:ILine[];
}
export function ConflictTopPanel(props:IProps){    
    return <div className="d-flex w-100 h-100 conflict-diff" style={{overflowY:'auto'}}>
        <div className={`w-50 previous `}>
            <ConflictDiffView color={EditorColors.line.previous} lines={props.previousLines} />
        </div>

        <div className={`w-50 previous ps-2 current`}>
            <ConflictDiffView color={EditorColors.line.previous} lines={props.currentLines} />
        </div>
    </div>
}