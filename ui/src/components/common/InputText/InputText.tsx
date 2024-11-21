import React from "react"

interface InputTextProps{
    text:string;
}

function InputTextComponent(props:InputTextProps){
    return <input type="text" style={{width:props.text.length+"ch"}} onChange={_=>{}} value={props.text} spellCheck={false} className="h-100 outline-none outline-none-focus" />
    
}

export const InputText = React.memo(InputTextComponent);