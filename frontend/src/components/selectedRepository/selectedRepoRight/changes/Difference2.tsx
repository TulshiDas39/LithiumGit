import { EditorColors, ILine } from "../../../../lib"
import { DiffView } from "./DiffView";

interface IProps{
    linesBeforeChange:ILine[];
    linesAfterChange:ILine[];
}

export function Difference2(props:IProps){
    console.log(props.linesBeforeChange);
    return <div className="d-flex w-100 h-100 gs-overflow-y-auto difference">
        {!!props.linesBeforeChange && <div className="w-50 h-100 overflow-auto">
            <DiffView color={EditorColors.line.previous} lines={props.linesBeforeChange} />
        </div>}
        <div className="w-50 h-100 overflow-auto">
            <DiffView color={EditorColors.line.current} lines={props.linesAfterChange} />
        </div>
    </div>
}