import { CSSProperties } from "react";
import { DiffUtils, EditorColors, ILine } from "../../../../lib";


interface IProps{
    previousLines:ILine[];
    currentLines:ILine[];
}

export function ConflictBottomPanel(props:IProps){

    const getElements=()=>{
        const maxWithOfCurLines = DiffUtils.getEditorWidth(props.currentLines.map(x=>x.text?x.text:""));
        const maxWithOfPreLines = DiffUtils.getEditorWidth(props.previousLines.map(x=>x.text?x.text:""));
        const editorWidth = Math.max(maxWithOfCurLines,maxWithOfPreLines);

        const elems:JSX.Element[] = [];
        const paragraphStyles:CSSProperties={
            minWidth:editorWidth+"ch",
        }
        for(let i = 0;i<props.currentLines.length;i++){
            let curLine = props.currentLines[i];
            let preLine = props.previousLines[i];
            if(curLine.conflictNo){
                let elem = <p key={i} style={{...paragraphStyles}} className=""> 
                            <span className="hover color-secondary underline">Accept Current Change</span> 
                            <span> | </span>
                            <span className="hover color-secondary underline">Accept Incoming Change</span>
                            <span> | </span>
                            <span className="hover color-secondary underline">Accept Both Change</span>
                        </p>;
                elems.push(elem);
                elems.push( <p style={{...paragraphStyles, background:`${EditorColors.line.current.background}`}} key={i+1}>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD (Current Changes)</p>)

                const curElems:JSX.Element[] = [];
                const preElems:JSX.Element[] = [];
                while(curLine.conflictNo){
                    if(curLine.text !== undefined)
                        curElems.push(<p key={i+2} style={{ ...paragraphStyles,background:`${EditorColors.line.current.background}` }}>{curLine.text}</p>)
                    if(preLine.text !== undefined)
                        preElems.push(<p key={i+3} style={{...paragraphStyles,background:`${EditorColors.line.previous.background}` }}>{preLine.text}</p>)
                    i++;
                    curLine = props.currentLines[i];
                    preLine = props.previousLines[i];
                }

                curElems.forEach(e => elems.push(e));
                preElems.forEach(e => elems.push(e));
                i--;
            }
            else{
                elems.push(<p key={i} style={{...paragraphStyles}}>{curLine.text}</p>)
            }
        }

        return elems;
    }

    return <div className="h-100 w-100 conflict-bottom overflow-auto">
        {getElements()}
    </div>
}