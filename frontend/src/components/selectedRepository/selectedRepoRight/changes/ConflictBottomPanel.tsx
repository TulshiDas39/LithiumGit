import { CSSProperties } from "react";
import { ConflictUtils, DiffUtils, ILine } from "../../../../lib";

interface ISingleConflictLineProps{
    className:string;
    conflictNo:number;
    editorWidth:number;
    text:string;
}
export function SingleConflictLine(props:ISingleConflictLineProps) {
   return <p className={`content conflict conflictNo_${props.conflictNo} ${props.className}`} style={{minWidth:props.editorWidth+"ch" }}>{props.text || <br/>}</p>
}

interface IProps{
    previousLines:ILine[];
    currentLines:ILine[];
}

export function ConflictBottomPanel(props:IProps){

    const getElements=()=>{
        const maxWithOfCurLines = ConflictUtils.CurrentEditorWidth;
        const maxWithOfPreLines = ConflictUtils.IncomingEditorWidth;
        const editorWidth = Math.max(maxWithOfCurLines,maxWithOfPreLines);

        const elems:JSX.Element[] = [];
        const lineNumbers:JSX.Element[] = [];
        const paragraphStyles:CSSProperties={
            minWidth:editorWidth+"ch",
        }
        let line = 1;
        for(let i = 0;i<props.currentLines.length;i++){
            let curLine = props.currentLines[i];
            let preLine = props.previousLines[i];
            if(curLine.conflictNo){
                const conflictNo = curLine.conflictNo;
                let elem = <p key={i} style={{...paragraphStyles}} className={`noselect marker conflict conflictNo_${curLine.conflictNo}`}> 
                            <span className="hover color-secondary underline">Accept Current Change</span> 
                            <span> | </span>
                            <span className="hover color-secondary underline">Accept Incoming Change</span>
                            <span> | </span>
                            <span className="hover color-secondary underline">Accept Both Changes</span>
                        </p>;
                elems.push(elem);
                lineNumbers.push(<p key={Date.now()} className={`conflict noLine conflictNo_${curLine.conflictNo} noselect`}><br/></p>)
                elems.push( <p style={{...paragraphStyles}} key={i+1}
                    className={`bg-current-change-deep marker conflict conflictNo_${curLine.conflictNo}`}>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD <span className={`noselect color-secondary`}>(Current Changes)</span></p>)
                lineNumbers.push(<p className={`conflict lineNo conflictNo_${curLine.conflictNo} noselect`} key={line}>{line}</p>);
                line++;

                const curElems:JSX.Element[] = [];
                const preElems:JSX.Element[] = [];
                while(curLine.conflictNo){
                    if(curLine.text !== undefined){
                        curElems.push(<SingleConflictLine key={i+2} className={`current bg-current-change`} conflictNo={curLine.conflictNo} editorWidth={editorWidth} text={curLine.text}  />)
                        lineNumbers.push(<p key={line} className={`lineNo conflict conflictNo_${curLine.conflictNo} noselect`}>{line}</p>);
                        line++;
                    }
                    if(preLine.text !== undefined){
                        preElems.push(<SingleConflictLine key={i+3} className={`incoming bg-previous-change`} conflictNo={curLine.conflictNo} text={preLine.text} editorWidth={editorWidth} />)
                        lineNumbers.push(<p key={line} className={`lineNo conflict conflictNo_${curLine.conflictNo} noselect`}>{line}</p>);
                        line++;
                    }
                    i++;
                    curLine = props.currentLines[i];
                    preLine = props.previousLines[i];
                }
                i--;
                curLine = props.currentLines[i];
                curElems.forEach(e => elems.push(e));
                elems.push(<p key={Date.now()} style={{...paragraphStyles}} className={`marker conflict conflictNo_${curLine.conflictNo}`}>{ConflictUtils.Separator}</p>)
                lineNumbers.push(<p key={line} className={`lineNo conflict conflictNo_${curLine.conflictNo} noselect`} >{line}</p>);
                line++;
                preElems.forEach(e => elems.push(e));
                elems.push(<p key={Date.now()+1} className={`bg-previous-change-deep marker conflict conflictNo_${curLine.conflictNo}`} style={{...paragraphStyles}}>{ConflictUtils.GetEndingMarkerText(curLine.conflictNo!)?.text}
                    <span className="color-secondary noselect"> (Incoming Change)</span></p>)
                lineNumbers.push(<p key={line} className={`lineNo conflict conflictNo_${curLine.conflictNo} noselect`}>{line}</p>);
                line++;                    

            }
            else{
                elems.push(<p key={i} className={`content`} style={{...paragraphStyles}}>{curLine.text || <br/>}</p>)
                lineNumbers.push(<p key={line}>{line}</p>);
                line++;
            }
        }

        return {contents:elems,lineNumbers};
    }

    const elements = getElements();

    return <div className="h-100 w-100 conflict-bottom overflow-auto d-flex">
        <div className="pe-2 line-container">
            {elements.lineNumbers}
        </div>
        <div className="flex-grow-1">
            {elements.contents}
        </div>
    </div>
}