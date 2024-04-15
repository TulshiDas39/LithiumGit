import { Fragment } from "react";
import { ILine } from "../../../../lib";

interface ISingleLineProps{
    line:ILine;
    color:string;
}

function SingleLine(props:ISingleLineProps){
    return <Fragment>
        {props.isFirstConflict && 
        <Fragment>
        <p> 
            <span className="hover">Accept Current Change</span> 
            <span> |</span>
            <span className="hover">Accept Incoming Change</span>
            <span> |</span>
            <span className="hover">Accept Both Change</span>
        </p>
        <p> &gt;&gt;&gt;&gt;&gt;&gt;&gt; HEAD (Current Changes)</p>
        </Fragment>}
        {!!props.currentLine.conflictNo &&
            <Fragment>
                <p>{}</p>
            </Fragment>
        }
    </Fragment>
}

interface IProps{
    previousLines:ILine[];
    currentLines:ILine[];
}

export function ConflictBottomPanel(props:IProps){
    return <div className="h-100 w-100">
        {
            props.currentLines.map((line,ind)=>(
                // <SingleLine line={} />
            ))
        }
    </div>
}