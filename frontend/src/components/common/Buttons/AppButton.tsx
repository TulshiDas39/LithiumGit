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
    return <div className={`${config.bgColor} hover-brighter text-center cur-default hover-shadow p-1`} onClick={props.onClick}
        style={{borderStyle:"solid", borderWidth:getBorderSize(),borderColor:props.borderColor || "rgba(0,0,0,.2)", minWidth:50}}>
        {props.text}
    </div>
}

export const AppButton = React.memo(AppButtonComponent);