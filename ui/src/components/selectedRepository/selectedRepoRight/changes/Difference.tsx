import { EnumDiffViewMode } from "common_library";
import { ConfigUtils, DiffUtils, EditorColors, ILine } from "../../../../lib"
import { DiffView } from "./DiffView";
import { UnifiedDiffView } from "./UnifiedDiffView";

interface IProps{
    linesBeforeChange:ILine[];
    linesAfterChange:ILine[];
    id?:string;
    allowUnifiedView?:boolean;
}

export function Difference(props:IProps){
    const bothPresent = !!props.linesBeforeChange && !!props.linesAfterChange;
    const isUnified = !!props.allowUnifiedView && bothPresent && ConfigUtils.diffViewMode === EnumDiffViewMode.Unified;

    if(isUnified){
        const unifiedLines = DiffUtils.ToUnifiedLines(props.linesBeforeChange, props.linesAfterChange);
        return <div id={props.id} className="d-flex w-100 h-100 difference unified" style={{overflowY:'hidden'}}>
            <UnifiedDiffView lines={unifiedLines} />
        </div>
    }

    return <div id={props.id} className="d-flex w-100 h-100 difference" style={{overflowY:'hidden'}}>
        {!!props.linesBeforeChange && <div className={`h-100 w-${!!props.linesAfterChange?"50":"100"} previous `}>
            <DiffView changeType="previous" lines={props.linesBeforeChange} />
        </div>}
        {!!props.linesAfterChange && <div className={`h-100 w-${!!props.linesBeforeChange?"50":"100"} ps-2 current`}>
            <DiffView changeType="current" lines={props.linesAfterChange} />
        </div>}
    </div>
}
