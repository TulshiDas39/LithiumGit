import { FaCheck } from "react-icons/fa";
import { DiffUtils, ILine } from "../../../../lib";
import { AppButton } from "../../../common";

interface ISingleDiffProps{
    line:ILine;    
    maxLineWidth:number;
    backGroupColorCss:string;
    forGroupColorCss:string;
}

function SingleDiff(props:ISingleDiffProps){
    const paragraphStyle:React.CSSProperties = {
        whiteSpace:'pre', 
        minWidth:props.maxLineWidth+"ch",
    }

    if(props.line.text != undefined){
        const childElems:JSX.Element[] = [];
        const heightLightCount = props.line.textHightlightIndex.length;
        if(heightLightCount){
            let insertedUptoIndex = -1;
            props.line.textHightlightIndex.forEach((range,i)=>{                        
                if(range.fromIndex > insertedUptoIndex+1 ){
                    const elem = <span key={i} className={`d-inline-block ${props.backGroupColorCss}`}>{props.line.text!.substring(insertedUptoIndex+1,range.fromIndex)}</span>;
                    childElems.push(elem);                    
                }
                const elem = <span key={i} className={`d-inline-block ${props.forGroupColorCss}`}>{props.line.text!.substring(range.fromIndex, range.fromIndex+range.count)}</span>;
                childElems.push(elem);
                insertedUptoIndex = range.fromIndex+range.count-1;
            });
            if(insertedUptoIndex < props.line.text.length-1){
                const elem = <span key={props.line.textHightlightIndex.length} className={`d-inline-block ${props.backGroupColorCss}`}>{props.line.text.substring(insertedUptoIndex+1)}</span>;
                childElems.push(elem);
            }
        }        
        else{
            if(props.line.text) childElems.push(<span key={1} className="">{props.line.text}</span>)
            else childElems.push(<br key={1}/>);
        }
        return <div className={`${props.line.hightLightBackground? props.backGroupColorCss:""}`} style={{...paragraphStyle}}>{childElems}</div>
    }

    return <div className="transparent-background noselect" style={{...paragraphStyle}}> </div>
}

interface IProps{
    lines:ILine[];
    changeType:"current" | "previous";
}
export function DiffView(props:IProps){
    const editorWidth = DiffUtils.getEditorWidth(props.lines.map(x=>x.text?x.text:""));
    const getLineElems = ()=>{
        const elems:JSX.Element[]=[];
        let lineNo = 1;
        let i = 0;
        for(let line of props.lines){
            if(line.text === undefined){
                elems.push(<p key={i}> <br /> </p>)
            }
            else{
                elems.push(<p key={i}>{lineNo}</p>);
                lineNo++;
            }
            i++;
        }
        return elems;
    }
    const lineDivWidth = ((props.lines.filter(_=> _.text !== undefined).length)+"").length + 2;
    return <div className="d-flex w-100 h-100 position-relative diff-view">
        <div className="noselect line_numbers overflow-y-hidden h-100" style={{width:lineDivWidth+"ch"}}>
            {getLineElems()}
        </div>
        {props.changeType === "current" && <div className="diff-action-container overflow-y-hidden h-100" style={{width: '2ch'}}></div>}
        <div className="h-100 content-container overflow-auto" style={{width:`calc(100% - ${lineDivWidth+2}ch)`}}>
            <div className="ps-1 content fit-content min-w-100">
                {props.lines.map((l, i)=>(
                    <SingleDiff key={i} line={l} backGroupColorCss={`bg-${props.changeType}-change`} forGroupColorCss={`bg-${props.changeType}-change-deep`} maxLineWidth={editorWidth}  />
                ))}
            </div>            
        </div>
        {props.changeType === "current" && <div className="position-absolute save-btn-container d-none">
                <AppButton type="success" className="h-100 w-100 py-2 btn-save">
                    <span className="">Save</span>                    
                </AppButton>
            </div>}
    </div>
}

