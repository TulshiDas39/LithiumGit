import React from "react"

interface InputTextProps{
    text:string;
    width?:string;
}

function InputTextComponent(props:InputTextProps){
    const width = props.width ?? props.text.length+"ch";
    return <input type="text" style={{width}} onChange={_=>{}} value={props.text} spellCheck={false} className="h-100 outline-none outline-none-focus" />
    
}

export const InputText = React.memo(InputTextComponent);