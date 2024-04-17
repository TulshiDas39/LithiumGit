import { CSSProperties } from "react";
import { ConflictUtils, DiffUtils, EditorColors, ILine } from "../../../../lib";


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
                            <span className="hover color-secondary underline">Accept Both Changes</span>
                        </p>;
                elems.push(elem);
                elems.push( <p style={{...paragraphStyles}} key={i+1}
                    className="bg-current-change-deep">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD (Current Changes)</p>)

                const curElems:JSX.Element[] = [];
                const preElems:JSX.Element[] = [];
                while(curLine.conflictNo){
                    if(curLine.text !== undefined)
                        curElems.push(<p key={i+2} className="bg-current-change" style={{ ...paragraphStyles }}>{curLine.text}</p>)
                    if(preLine.text !== undefined)
                        preElems.push(<p key={i+3} className="bg-previous-change" style={{...paragraphStyles }}>{preLine.text}</p>)
                    i++;
                    curLine = props.currentLines[i];
                    preLine = props.previousLines[i];
                }
                i--;
                curElems.forEach(e => elems.push(e));
                elems.push(<p key={Date.now()} style={{...paragraphStyles}}>{ConflictUtils.Separator}</p>)
                preElems.forEach(e => elems.push(e));
                elems.push(<p key={Date.now()+1} className="bg-previous-change-deep" style={{...paragraphStyles}}>{ConflictUtils.GetEndingMarkerText(props.currentLines[i].conflictNo!)?.text}
                    <span className="color-secondary"> (Incoming Change)</span></p>)

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