import { EnumConflictSide } from "common_library";
import { ConflictUtils, EnumHtmlIds, IConflictLine } from "../../../../lib"
import { ConflictDiffView } from "./ConflictDiffView";

interface IProps{
    previousLines:IConflictLine[];
    currentLines:IConflictLine[];
}

export function ConflictTopPanel(props:IProps){    

    const incomingConflictLines = props.previousLines.filter(x => !!x.conflictNo);
    const currentConflictLines = props.currentLines.filter(x => !!x.conflictNo);
    const topLabelInCbChecked = !!incomingConflictLines.length && incomingConflictLines.every(x=> !!x.taken);
    const topLabelCurCbChecked = !!currentConflictLines.length && currentConflictLines.every(x=> !!x.taken);
    const inLineDivWidth = ConflictUtils.getConflictLineDivWidth(props.previousLines) - 3;
    const curLineDivWidth = ConflictUtils.getConflictLineDivWidth(props.currentLines) - 3;

    return <div className="h-100">
            <div style={{height:30}} className="d-flex align-items-center w-100 border-bottom">
                <div className={"w-50 d-flex align-items-center"} style={{paddingLeft:inLineDivWidth+'ch'}}>
                    <div className="check_all_incoming d-flex justify-content-end">
                        <input id={EnumHtmlIds.accept_all_incoming} type="checkbox" title="Accept all incoming changes" defaultChecked={topLabelInCbChecked} />
                    </div>
                    <label htmlFor={EnumHtmlIds.accept_all_incoming} className="ps-2 cur-default">Incoming changes</label>
                </div>
                <div className="w-50 d-flex align-items-center" style={{paddingLeft:curLineDivWidth+'ch'}}>
                    <div className="check_all_current d-flex justify-content-end">
                        <input id={EnumHtmlIds.accept_all_current} type="checkbox" title="Accept all current changes" defaultChecked={topLabelCurCbChecked} />
                    </div>                
                    <label htmlFor={EnumHtmlIds.accept_all_current} className="ps-2 cur-default">Current changes</label>
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