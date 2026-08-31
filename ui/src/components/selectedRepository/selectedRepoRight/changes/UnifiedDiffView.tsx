import { DiffUtils, IUnifiedLine } from "../../../../lib";

interface ISingleUnifiedLineProps{
    line:IUnifiedLine;
    maxLineWidth:number;
}

function SingleUnifiedLine(props:ISingleUnifiedLineProps){
    const paragraphStyle:React.CSSProperties = {
        whiteSpace:'pre',
        minWidth:props.maxLineWidth+"ch",
    }
    const backGroupColorCss = props.line.side === "removed" ? "bg-previous-change" : props.line.side === "added" ? "bg-current-change" : "";
    const forGroupColorCss = props.line.side === "removed" ? "bg-previous-change-deep" : "bg-current-change-deep";

    if(props.line.text === undefined)
        return <div className="transparent-background noselect" style={{...paragraphStyle}}> </div>

    const childElems:JSX.Element[] = [];
    const heightLightCount = props.line.textHightlightIndex.length;
    if(heightLightCount){
        let insertedUptoIndex = -1;
        props.line.textHightlightIndex.forEach((range,i)=>{
            if(range.fromIndex > insertedUptoIndex+1){
                const elem = <span key={i} className={`d-inline-block ${backGroupColorCss}`}>{props.line.text!.substring(insertedUptoIndex+1,range.fromIndex)}</span>;
                childElems.push(elem);
            }
            const elem = <span key={i} className={`d-inline-block ${forGroupColorCss}`}>{props.line.text!.substring(range.fromIndex, range.fromIndex+range.count)}</span>;
            childElems.push(elem);
            insertedUptoIndex = range.fromIndex+range.count-1;
        });
        if(insertedUptoIndex < props.line.text.length-1){
            const elem = <span key={props.line.textHightlightIndex.length} className={`d-inline-block ${backGroupColorCss}`}>{props.line.text.substring(insertedUptoIndex+1)}</span>;
            childElems.push(elem);
        }
    }
    else{
        if(props.line.text) childElems.push(<span key={1}>{props.line.text}</span>)
        else childElems.push(<br key={1}/>);
    }

    return <div className={`d-flex ${props.line.hightLightBackground || props.line.side !== "context" ? backGroupColorCss : ""}`} style={{...paragraphStyle}}>
        <span className="ps-1">{props.line.side === "removed" ? "-" : props.line.side === "added" ? "+" : " "}</span>
        <span className="ps-1">{childElems}</span>
    </div>
}

interface IProps{
    lines:IUnifiedLine[];
}

export function UnifiedDiffView(props:IProps){
    const editorWidth = DiffUtils.getEditorWidth(props.lines.map(x=>x.text?x.text:""));
    const lineDivWidth = Math.max(...props.lines.map(l=> Math.max(l.oldLineNo ?? 0, l.newLineNo ?? 0)),1).toString().length + 2;

    return <div className="d-flex w-100 h-100 position-relative diff-view">
        <div className="noselect line_numbers overflow-y-hidden h-100 d-flex">
            <div style={{width:lineDivWidth+"ch"}}>
                {props.lines.map((l,i)=>(<p key={i} className={l.side==="added"?"opacity-25":""}>{l.oldLineNo ?? <br />}</p>))}
            </div>
            <div style={{width:lineDivWidth+"ch"}}>
                {props.lines.map((l,i)=>(<p key={i} className={l.side==="removed"?"opacity-25":""}>{l.newLineNo ?? <br />}</p>))}
            </div>
        </div>
        <div className="h-100 content-container overflow-auto" style={{width:`calc(100% - ${lineDivWidth*2}ch)`}}>
            <div className="ps-1 content fit-content min-w-100">
                {props.lines.map((l,i)=>(
                    <SingleUnifiedLine key={i} line={l} maxLineWidth={editorWidth} />
                ))}
            </div>
        </div>
    </div>
}
