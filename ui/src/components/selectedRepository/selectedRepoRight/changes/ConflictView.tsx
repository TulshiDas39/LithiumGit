import { EnumHtmlIds, ILine } from "../../../../lib"
import { ConflictTopPanel } from "./ConflictTopPanel";

interface IProps{
    incomingLines:ILine[];
    currentLines:ILine[];
}

export function ConflictView(props:IProps){

    return <div id="conflict-editor" className="h-100 w-100">        
        <div className="h-100">
            <div className="w-100 top-diff" id={EnumHtmlIds.ConflictEditorTopPanel} style={{height:`calc(50% - 3px)`}}>
                <ConflictTopPanel currentLines={props.currentLines}
                    previousLines={props.incomingLines} />
            </div>
            <div className="w-100 bg-second-color resizer cur-resize-v" style={{height:3}}/>
            <div className="w-100" id={EnumHtmlIds.ConflictEditorBottomPanel} style={{height:`50%`}}>
                <div className="h-100 w-100 d-flex conflict-bottom">
                    <div className="noselect line_numbers overflow-y-hidden h-100"></div>
                    <div className="h-100 content-container overflow-auto flex-grow-1">
                        <div className="ps-1 content fit-content min-w-100"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
