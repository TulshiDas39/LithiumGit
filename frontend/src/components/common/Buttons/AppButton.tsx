import React, { CSSProperties, PropsWithChildren, useMemo } from "react"

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
    onClick?:(e: React.MouseEvent<HTMLDivElement, MouseEvent>)=>void;
    text?:string;
    borderSize?:number;
    borderColor?:string;
    disabled?:boolean;
    style?:CSSProperties;
    className?:string;
    title?:string;
}


function AppButtonComponent(props:PropsWithChildren<IProps>){
    const config = getButtonConfigs(props.type);
    const getBorderSize = ()=>{
        if(props.borderSize !== undefined)
            return props.borderSize;
        if(props.type === "default")
            return 1;
        return 0;
    }
    const styles = useMemo(()=>{
        let style:CSSProperties = {
            borderStyle:"solid", 
            borderWidth:getBorderSize(),
            borderColor:props.borderColor || "rgba(0,0,0,.2)", 
            paddingLeft: '1rem',
            paddingRight: '1rem',
        };
        if(props.style){
            style = {...style,...props.style};
        }
        return style;
    },[props.style])

    return <div title={props.title} className={`${config.bgColor} ${props.disabled?'':'hover-brighter hover-shadow'} d-flex align-items-center justify-content-center text-center cur-default py-1 ${props.className?props.className:''}`} onClick={props.disabled?undefined:props.onClick}
        style={styles}>
        {props.children || props.text}
    </div>
}

export const AppButton = React.memo(AppButtonComponent);