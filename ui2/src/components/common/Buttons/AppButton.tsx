import React, { CSSProperties, PropsWithChildren, useMemo } from "react"

type ButtonType = "default"|"success"|"danger"|"info"|"primary"|"text";

interface IConfig{
    type:ButtonType;
    bgColor:string;    
}

function getButtonConfigs(type:ButtonType){
    const configs:IConfig[]=[
        {
            type:"default",
            bgColor:"",
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
        },
        {
            type:"text",
            bgColor:"transparent"
        }
    ]

    return configs.find(_=> _.type === type)!;
}

interface IProps{
    type?:ButtonType;
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
    const type = props.type || "default";
    const config = getButtonConfigs(type);
    const getBorderSize = ()=>{
        if(props.borderSize !== undefined)
            return props.borderSize;
        if(type === "text")
            return 0;
        if(type === "default")
            return 1;
        return 0;
    }

    const getClasses=()=>{
        if(type === "default")
            return "default-button";
        return "";
    }

    const getHoverClasses=()=>{
        if(props.disabled){
            return "";
        }
        if(type === "text"){
            return "hover-color cur-point";
        }
        return "hover-brighter hover-shadow cur-default";
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

    return <div title={props.title} className={`${config.bgColor} ${getClasses()} ${getHoverClasses()} ${props.disabled?'disabled':''} d-flex align-items-center justify-content-center text-center py-1 ${props.className?props.className:''}`} onClick={props.disabled?undefined:props.onClick}
        style={styles}>
        {props.children || props.text}
    </div>
}

export const AppButton = React.memo(AppButtonComponent);