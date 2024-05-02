import { EnumConflictSide } from "common_library";
import { DiffUtils, ILine } from "../../../../lib";


interface ISingleDiffProps{
    line:ILine;
    maxLineWidth:number;
    colorClass:string;
    conflictNo:number;
    side:EnumConflictSide;
}

function SingleDiff(props:ISingleDiffProps){
    const paragraphStyle:React.CSSProperties = {
        whiteSpace:'pre', 
        minWidth:props.maxLineWidth+"ch",
    }

    const colorClass = props.line.hightLightBackground? props.colorClass:'';
    const conflictClass = props.line.conflictNo? `${props.side}_${props.line.conflictNo}` : "";

    if(props.line.text != undefined){
        const childElems:JSX.Element[] = [];        
        if(props.line.text) childElems.push(<span key={1} className="py-1">{props.line.text}</span>)
        else childElems.push(<br key={1}/>);
    
        return <p className={`${colorClass} ${conflictClass}`} style={{...paragraphStyle}}>{childElems}</p>
    }

    return <p className={`transparent-background noselect ${colorClass} ${conflictClass}`} style={{...paragraphStyle}}> </p>
}

interface IProps{
    lines:ILine[];
    colorClass:string;
    lineDivWidth:number;
    side:EnumConflictSide;
}

export function ConflictDiffView(props:IProps){
    const editorWidth = DiffUtils.getEditorWidth(props.lines.map(x=>x.text?x.text:""));
    const getLineElems = ()=>{
        const elems:JSX.Element[]=[];
        let lineNo = 1;
        for(let i =0 ;i< props.lines.length;i++){
            const line = props.lines[i];
            let startOfConflict = !!line.conflictNo && !props.lines[i-1]?.conflictNo;        
            if(line.text === undefined){        
                const child = startOfConflict ? <input id={`${props.side}_${line.conflictNo}`} type="checkbox" /> : <br />;                
                elems.push(<p key={i} className="d-flex justify-content-end w-100"> {child} </p>)
            }
            else{
                const checkBox = startOfConflict ? <span className="flex-grow-1 text-end"><input id={`${props.side}_${line.conflictNo}`} type="checkbox" /></span>  : null;
                elems.push(<p key={i} className="d-flex w-100">{lineNo} {checkBox}</p>);
                lineNo++;
            }
        }
        return elems;
    }
    // const lineDivWidth = ((props.lines.filter(_=> _.text !== undefined).length)+"").length + 3;
    return <div className="d-flex w-100">
        <div className="noselect line_numbers" style={{width:props.lineDivWidth+"ch"}}>
            {getLineElems()}
        </div>
        <div className="ps-1 content" style={{width:`calc(100% - ${props.lineDivWidth}ch)`,overflowY:'hidden'}}>
            {props.lines.map((l, i)=>(
                <SingleDiff key={i} line={l} colorClass={props.colorClass} maxLineWidth={editorWidth} 
                    conflictNo={l.conflictNo!} side={props.side} />
            ))}
        </div>
    </div>
}