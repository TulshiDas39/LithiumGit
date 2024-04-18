import { DiffUtils, ILine, ILineHighlight } from "../../../../lib";


interface ISingleDiffProps{
    line:ILine;
    maxLineWidth:number;
    colorClass:string;
}

function SingleDiff(props:ISingleDiffProps){
    const paragraphStyle:React.CSSProperties = {
        whiteSpace:'pre', 
        minWidth:props.maxLineWidth+"ch",
    }

    const colorClass = props.line.hightLightBackground? props.colorClass:'';

    if(props.line.text != undefined){
        const childElems:JSX.Element[] = [];        
        if(props.line.text) childElems.push(<span key={1} className="py-1">{props.line.text}</span>)
        else childElems.push(<br key={1}/>);
    
        return <p className={`${colorClass}`} style={{...paragraphStyle}}>{childElems}</p>
    }

    return <p className={`transparent-background noselect ${props.colorClass}`} style={{...paragraphStyle}}> </p>
}

interface IProps{
    lines:ILine[];
    colorClass:string;    
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
                const child = startOfConflict ? <input type="checkbox" /> : <br />;                
                elems.push(<p key={i} className="d-flex justify-content-end"> {child} </p>)
            }
            else{
                const checkBox = startOfConflict ? <span className="flex-grow-1 text-end"><input type="checkbox" /></span>  : null;
                elems.push(<p key={i} className="d-flex">{lineNo} {checkBox}</p>);
                lineNo++;
            }
        }
        return elems;
    }
    const lineDivWidth = ((props.lines.filter(_=> _.text !== undefined).length)+"").length + 3;
    return <div className="d-flex w-100">
        <div className="noselect line_numbers" style={{width:lineDivWidth+"ch"}}>
            {getLineElems()}
        </div>
        <div className="ps-1 content" style={{width:`calc(100% - ${lineDivWidth}ch)`,overflowY:'hidden'}}>
            {props.lines.map((l, i)=>(
                <SingleDiff key={i} line={l} colorClass={props.colorClass} maxLineWidth={editorWidth}  />
            ))}
        </div>
    </div>
}