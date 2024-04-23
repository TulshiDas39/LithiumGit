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
        const lineNumbers:JSX.Element[] = [];
        const paragraphStyles:CSSProperties={
            minWidth:editorWidth+"ch",
        }
        let line = 1;
        for(let i = 0;i<props.currentLines.length;i++){
            let curLine = props.currentLines[i];
            let preLine = props.previousLines[i];
            if(curLine.conflictNo){
                let elem = <p key={i} style={{...paragraphStyles}} className={`noselect marker conflict conflictNo_${curLine.conflictNo}`}> 
                            <span className="hover color-secondary underline">Accept Current Change</span> 
                            <span> | </span>
                            <span className="hover color-secondary underline">Accept Incoming Change</span>
                            <span> | </span>
                            <span className="hover color-secondary underline">Accept Both Changes</span>
                        </p>;
                elems.push(elem);
                lineNumbers.push(<p key={Date.now()} className={`conflict lineNo conflictNo_${curLine.conflictNo}`}><br/></p>)
                elems.push( <p style={{...paragraphStyles}} key={i+1}
                    className={`bg-current-change-deep marker conflict conflictNo_${curLine.conflictNo}`}>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD <span className={`noselect color-secondary`}>(Current Changes)</span></p>)
                lineNumbers.push(<p key={line}>{line}</p>);
                line++;

                const curElems:JSX.Element[] = [];
                const preElems:JSX.Element[] = [];
                while(curLine.conflictNo){
                    if(curLine.text !== undefined){
                        curElems.push(<p key={i+2} className={`current content conflict conflictNo_${curLine.conflictNo} bg-current-change`} style={{ ...paragraphStyles }}>{curLine.text || <br/>}</p>)
                        lineNumbers.push(<p key={line} className={`lineNo conflict conflictNo_${curLine.conflictNo}`}>{line}</p>);
                        line++;
                    }
                    if(preLine.text !== undefined){
                        preElems.push(<p key={i+3} className={`incoming content bg-previous-change conflict conflictNo_${curLine.conflictNo}`} style={{...paragraphStyles }}>{preLine.text || <br/>}</p>)
                        lineNumbers.push(<p key={line} className={`lineNo conflict conflictNo_${curLine.conflictNo}`}>{line}</p>);
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
                lineNumbers.push(<p key={line} className={`lineNo conflict conflictNo_${curLine.conflictNo}`}>{line}</p>);
                line++;
                preElems.forEach(e => elems.push(e));
                elems.push(<p key={Date.now()+1} className={`bg-previous-change-deep marker conflict conflictNo_${curLine.conflictNo}`} style={{...paragraphStyles}}>{ConflictUtils.GetEndingMarkerText(curLine.conflictNo!)?.text}
                    <span className="color-secondary noselect"> (Incoming Change)</span></p>)
                lineNumbers.push(<p key={line} className={`lineNo conflict conflictNo_${curLine.conflictNo}`}>{line}</p>);
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
        <div className="pe-2">
            {elements.lineNumbers}
        </div>
        <div className="flex-grow-1">
            {elements.contents}
        </div>
    </div>
}