import { EnumHtmlIds } from "../../../../lib";
import { ConflictBottomPanel } from "./ConflictBottomPanel";

interface IProps{
    topPanelHeight:string;
    bottomPanelHeight:string;
}

//the whole conflict editor shell, ConflictUtils renders it as static markup and fills the top panel afterwards
export function ConflictEditorView(props:IProps){
    return <>
        <div style={{height:30}} className="d-flex align-items-center w-100 border-bottom">
            <div className="w-50 d-flex align-items-center">
                <div className="check_all_incoming d-flex justify-content-end">
                    <input id={EnumHtmlIds.accept_all_incoming} type="checkbox" title="Accept all incoming changes" />
                </div>
                <div className="ps-2">Incoming changes</div>
            </div>
            <div className="w-50 d-flex align-items-center">
                <div className="check_all_current d-flex justify-content-end">
                    <input id={EnumHtmlIds.accept_all_current} type="checkbox" title="Accept all current changes" />
                </div>
                <div className="ps-2">Current changes</div>
            </div>
        </div>
        <div style={{height:'calc(100% - 33px)'}}>
            <div className="w-100" id={EnumHtmlIds.ConflictEditorTopPanel} style={{height:props.topPanelHeight}}>
            </div>
            <div className="w-100 bg-second-color cur-resize-v" style={{height:3}}/>
            <div className="w-100" id={EnumHtmlIds.ConflictEditorBottomPanel} style={{height:props.bottomPanelHeight}}>
                <ConflictBottomPanel />
            </div>
        </div>
    </>
}
