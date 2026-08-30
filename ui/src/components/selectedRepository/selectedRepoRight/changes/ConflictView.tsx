import { useMemo, useRef } from "react"
import { EnumHtmlIds, ILine, useDrag } from "../../../../lib"
import { ConflictTopPanel } from "./ConflictTopPanel";

interface IProps{
    incomingLines:ILine[];
    currentLines:ILine[];
}

export function ConflictView(props:IProps){
    const hightDisplacementRef = 0;//useRef(0);
    const hightDisplacement = 0;
    // const positionRef = useRef(0);
    // const {currentMousePosition:position,elementRef:resizer} = useDrag();

    // const hightDisplacement = useMemo(()=>{
    //     return 0;
    //     if(!position){
    //         hightDisplacementRef.current -= positionRef.current;
    //         positionRef.current = 0;
    //         return hightDisplacementRef.current;
    //     }
    //     positionRef.current = position.y;
    //     return hightDisplacementRef.current - positionRef.current;
    // },[position?.y])


    const getSign=(value:number)=>{
        if(value < 0)
            return "-";
        return "+";
    }

    return <div id="conflict-editor"  className="h-100 w-100">
        <div style={{height:30}} className="d-flex align-items-center w-100 border-bottom">
            <div className={"w-50 d-flex align-items-center"}>
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
            <div className="w-100 top-diff" id={EnumHtmlIds.ConflictEditorTopPanel} style={{height:`calc(50% ${getSign(-(0+3))}  ${Math.abs(hightDisplacement+3)}px)`}}>
                <ConflictTopPanel currentLines={props.currentLines}
                    previousLines={props.incomingLines} />
            </div>
            <div className="w-100 bg-second-color resizer cur-resize-v" style={{height:3}}/>
            <div className="w-100" id={EnumHtmlIds.ConflictEditorBottomPanel} style={{height:`calc(50% ${getSign(0)} ${Math.abs(0)}px)`}}>
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
