import { EnumConflictSide } from "common_library";
import { DiffUtils, IConflictLine } from "../../../../lib";


interface ISingleDiffProps{
    line:IConflictLine;
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

    const classNames:string[] = [];
    if(props.line.conflictNo){
        classNames.push(`${props.side}_${props.line.conflictNo}`);
    } 

    if(props.line.taken){
        classNames.push("bg-change-accepted");
    }
    else if(props.line.taken === false){
        classNames.push("bg-fade","text-decoration-line-through");
    }
    else if(props.line.hightLightBackground){
        classNames.push(props.colorClass);
    }
    
    const classNameStr = classNames.join(" ");


    if(props.line.text != undefined){
        const childElems:JSX.Element[] = [];        
        if(props.line.text) childElems.push(<span key={1} className="py-1">{props.line.text}</span>)
        else childElems.push(<br key={1}/>);
    
        return <p className={`${classNameStr}`} style={{...paragraphStyle}}>{childElems}</p>
    }

    return <p className={`transparent-background noselect ${classNameStr}`} style={{...paragraphStyle}}> </p>
}

interface IProps{
    lines:IConflictLine[];
    colorClass:string;
    side:EnumConflictSide;
}

export function ConflictDiffView(props:IProps){
    const editorWidth = DiffUtils.getEditorWidth(props.lines.map(x=>x.text?x.text:""));
    const lineDivWidth = String(props.lines.filter(l => l.text !== undefined).length).length + 3;
    const getLineElems = ()=>{
        const elems:JSX.Element[]=[];
        let lineNo = 1;
        for(let i =0 ;i< props.lines.length;i++){
            const line = props.lines[i];
            let startOfConflict = !!line.conflictNo && !props.lines[i-1]?.conflictNo;        
            if(line.text === undefined){        
                const child = startOfConflict ? <input id={`${props.side}_${line.conflictNo}`} type="checkbox" checked={!!line.taken} /> : <br />;                
                elems.push(<p key={i} className="d-flex justify-content-end w-100"> {child} </p>)
            }
            else{
                const checkBox = startOfConflict ? <span className="flex-grow-1 text-end"><input id={`${props.side}_${line.conflictNo}`} type="checkbox" checked={!!line.taken} /></span>  : null;
                elems.push(<p key={i} className="d-flex w-100">{lineNo} {checkBox}</p>);
                lineNo++;
            }
        }
        return elems;
    }
    return <div className="d-flex h-100 w-100">
        <div className="noselect line_numbers h-100 overflow-hidden" style={{width:lineDivWidth+"ch"}}>
            {getLineElems()}
        </div>
        <div className="ps-1 content h-100 overflow-auto" style={{width:`calc(100% - ${lineDivWidth}ch)`}}>
            {props.lines.map((l, i)=>(
                <SingleDiff key={i} line={l} colorClass={props.colorClass} maxLineWidth={editorWidth} 
                    conflictNo={l.conflictNo!} side={props.side} />
            ))}
        </div>
    </div>
}