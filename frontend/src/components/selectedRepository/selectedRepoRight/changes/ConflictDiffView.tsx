import { DiffUtils, ILine, ILineHighlight } from "../../../../lib";


interface ISingleDiffProps{
    line:ILine;
    color:ILineHighlight;
    maxLineWidth:number;
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
                    const elem = <span key={i} className="py-1" style={{background:props.color.background}}>{props.line.text!.substring(insertedUptoIndex+1,range.fromIndex)}</span>;
                    childElems.push(elem);                    
                }
                const elem = <span key={i} className="py-1" style={{background:props.color.forground}}>{props.line.text!.substring(range.fromIndex, range.fromIndex+range.count)}</span>;
                childElems.push(elem);
                insertedUptoIndex = range.fromIndex+range.count-1;
            });
            if(insertedUptoIndex < props.line.text.length-1){
                const elem = <span key={props.line.textHightlightIndex.length} className="py-1" style={{background:props.color.background}}>{props.line.text.substring(insertedUptoIndex+1)}</span>;
                childElems.push(elem);
            }
        }        
        else{
            if(props.line.text) childElems.push(<span key={1} className="py-1">{props.line.text}</span>)
            else childElems.push(<br key={1}/>);
        }
        return <p className="" style={{...paragraphStyle, background:props.line.hightLightBackground? props.color.background:undefined}}>{childElems}</p>
    }

    return <p className="transparent-background noselect" style={{...paragraphStyle}}> </p>
}

interface IProps{
    lines:ILine[];
    color:ILineHighlight;
}

export function ConflictDiffView(props:IProps){
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
    return <div className="d-flex w-100">
        <div className="noselect line_numbers" style={{width:lineDivWidth+"ch"}}>
            {getLineElems()}
        </div>
        <div className="ps-1 content" style={{width:`calc(100% - ${lineDivWidth}ch)`,overflowY:'hidden'}}>
            {props.lines.map((l, i)=>(
                <SingleDiff key={i} line={l} color={props.color} maxLineWidth={editorWidth}  />
            ))}
        </div>
    </div>
}