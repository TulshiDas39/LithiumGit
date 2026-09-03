import { EnumConflictSide } from "common_library";
import { EnumHtmlIds, IConflictLine } from "../../../../lib"
import { ConflictDiffView } from "./ConflictDiffView";

interface IProps{
    previousLines:IConflictLine[];
    currentLines:IConflictLine[];
}

export function ConflictTopPanel(props:IProps){    

    const topLabelInCbChecked = props.previousLines.filter(x => !!x.conflictNo).every(x=> !!x.taken);
    const topLabelCurCbChecked = props.currentLines.filter(x => !!x.conflictNo).every(x=> !!x.taken);
    
    return <div className="h-100">
            <div style={{height:30}} className="d-flex align-items-center w-100 border-bottom">
                <div className={"w-50 d-flex align-items-center"}>
                    <div className="check_all_incoming d-flex justify-content-end">
                        <input id={EnumHtmlIds.accept_all_incoming} type="checkbox" title="Accept all incoming changes" checked={topLabelInCbChecked} />
                    </div>
                    <div className="ps-2">Incoming changes</div>
                </div>
                <div className="w-50 d-flex align-items-center">
                    <div className="check_all_current d-flex justify-content-end">
                        <input id={EnumHtmlIds.accept_all_current} type="checkbox" title="Accept all current changes" checked={topLabelCurCbChecked} />
                    </div>                
                    <div className="ps-2">Current changes</div>
                </div>
            </div>
            <div className="d-flex w-100 conflict-diff" style={{height:`calc(100% - 30px)`}}>
                <div className={`w-50 h-100 previous `}>
                    <ConflictDiffView colorClass={"bg-previous-change"} lines={props.previousLines}
                        side={EnumConflictSide.Incoming} />
                </div>

                <div className={`w-50 h-100 ps-2 current`}>
                    <ConflictDiffView colorClass={"bg-current-change"} lines={props.currentLines}
                        side={EnumConflictSide.Current} />
                </div>
            </div>
    </div>
}