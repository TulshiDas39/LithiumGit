import { useEffect, useRef, useState } from "react";


export function useDrag(){
    const elementRef = useRef<HTMLElement>();
    const initialMousePosition = useRef<{x:number;y:number;}>();
    const [currentMousePosition,setCurrentMousePosition] = useState<{x:number,y:number}>();

    useEffect(()=>{
        if(!elementRef.current)
            return;

        const moveListener =(e:MouseEvent)=>{            
            setCurrentMousePosition({
                x:e.clientX-initialMousePosition.current!.x,
                y:e.clientY-initialMousePosition.current!.y
            });
        }    
        const downListener = (e:MouseEvent)=>{
            initialMousePosition.current = {x:e.clientX,y:e.clientY};
            document.addEventListener("mousemove",moveListener);
            document.addEventListener("mouseup",upListener);    
        }
        const upListener = ()=>{
            document.removeEventListener("mousemove",moveListener);
            document.removeEventListener("mouseup",upListener);    
            setCurrentMousePosition(undefined);
        }        
        
        elementRef.current?.addEventListener("mousedown",downListener);    

        return ()=>{
            elementRef.current?.removeEventListener("mousedown",downListener);    
        }
    },[elementRef.current]);

    return {
        currentMousePosition,
        elementRef:elementRef
    }
}