import React from "react"

type ButtonType = "default"|"success"|"danger"|"info"|"primary";

interface IConfig{
    type:ButtonType;
    bgColor:string;    
}

function getButtonConfigs(type:ButtonType){
    const configs:IConfig[]=[
        {
            type:"default",
            bgColor:"white",
        },
        {
            type:"primary",
            bgColor:"bg-primary"
        },
        {
            type:"success",
            bgColor:"bg-success"
        },
        {
            type:"danger",
            bgColor:"bg-danger"
        }
    ]

    return configs.find(_=> _.type === type)!;
}

interface IProps{
    type:ButtonType;
    onClick?:()=>void;
    text:string;
    borderSize?:number;
    borderColor?:string;
    disabled?:boolean;
}


function AppButtonComponent(props:IProps){
    const config = getButtonConfigs(props.type);
    const getBorderSize = ()=>{
        if(props.borderSize !== undefined)
            return props.borderSize;
        if(props.type === "default")
            return 1;
        return 0;
    }
    return <div className={`${config.bgColor} ${props.disabled?'':'hover-brighter hover-shadow'} text-center cur-default py-1 px-3`} onClick={props.disabled?undefined:props.onClick}
        style={{borderStyle:"solid", borderWidth:getBorderSize(),borderColor:props.borderColor || "rgba(0,0,0,.2)", minWidth:50}}>
        {props.text}
    </div>
}

export const AppButton = React.memo(AppButtonComponent);