import React from "react"

interface IProps{
    onChange:(e: React.ChangeEvent<HTMLInputElement>)=>void;
    value:string;
    placeholder?:string;
}

function AppInputFieldComponent(props:IProps){
    return <input placeholder={props.placeholder} type="text" className="h-100 w-100" value={props.value} onChange={props.onChange} />
}

export const AppInputField = React.memo(AppInputFieldComponent);