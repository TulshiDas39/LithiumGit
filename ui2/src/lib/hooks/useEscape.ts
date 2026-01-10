import { useEffect } from "react";
import { UiUtils } from "../utils";

export function useEscape(toggle:boolean,handler:()=>void){
    useEffect(()=>{
        if(toggle){
            UiUtils.registerEscapeHandler(handler);
        }
        return ()=>{
            UiUtils.removeEscapeHandler(handler);
        }

    },[toggle])
}