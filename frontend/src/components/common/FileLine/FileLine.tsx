import React, { useMemo } from "react";

interface IFileLineProps{
    text:string;
}

function FileLineComponent(props:IFileLineProps){
    const html = useMemo(()=>{
        let text = props.text;
        // text = text.replaceAll(" ","\&nbsp;");
        // text = text.replaceAll("\t","\&emsp;")
        return text;
    },[props.text])
    return <div>{html}</div>
}

export const FileLine = React.memo(FileLineComponent);