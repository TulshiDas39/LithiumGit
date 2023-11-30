import { ICommitInfo } from "common_library";
import { IPositionDiff, IPositition } from "../interfaces";
import * as ReactDOMServer from 'react-dom/server';


export class UiUtils {
    static removeIpcListeners(channels: string[],listeners?:any[]) {
        if(listeners){
            channels.forEach((c,index)=>{
                window.ipcRenderer.removeListener(c,listeners[index]);
            })
        }
        channels.forEach(channel => {
            window.ipcRenderer.removeAllListeners(channel);
        })
    }

    static updateHeadCommit=(commit:ICommitInfo)=>{

    }

    static handleDrag(element:HTMLElement,listener:(position?:IPositition)=>void){
        let initialMousePosition:IPositition | undefined = undefined;
        let currentMousePosition:IPositition | undefined = undefined;
        if(!element)
            return;

        const moveListener =(e:MouseEvent)=>{     
            currentMousePosition={
                x:e.clientX-initialMousePosition!.x,
                y:e.clientY-initialMousePosition!.y
            };
            listener(currentMousePosition);
        }
        const selectListener = (e:Event) => {
            e.preventDefault();
            return false
        };

        const downListener = (e:MouseEvent)=>{
            initialMousePosition = {x:e.clientX,y:e.clientY};
            document.addEventListener("mousemove",moveListener);
            document.addEventListener("mouseup",upListener);
            document.addEventListener("selectstart",selectListener);
        }
        const upListener = ()=>{
            document.removeEventListener("mousemove",moveListener);
            document.removeEventListener("mouseup",upListener);
            document.removeEventListener("selectstart",selectListener);
            currentMousePosition = undefined;
            listener(currentMousePosition);
        }        
        
        element?.addEventListener("mousedown",downListener);    

    }

    static HandleHorizontalDragging(element:HTMLElement,listener:(dx:number)=>void,
        initialiser:()=>void){
        let initialMousePositionX  = {value:-1};
        let positionDX = {value:-1};
        if(!element)
            return;

        const moveListener =(e:MouseEvent)=>{     
            positionDX.value = e.clientX - initialMousePositionX.value;
            listener(positionDX.value);
        }
        const selectListener = (e:Event) => {
            e.preventDefault();
            return false
        };

        const downListener = (e:MouseEvent)=>{
            initialiser();
            initialMousePositionX.value = e.clientX;
            document.addEventListener("mousemove",moveListener);
            document.addEventListener("mouseup",upListener);
            document.addEventListener("selectstart",selectListener);
        }
        const upListener = ()=>{
            document.removeEventListener("mousemove",moveListener);
            document.removeEventListener("mouseup",upListener);
            document.removeEventListener("selectstart",selectListener);
            listener(positionDX.value);            
        }        
        
        element?.addEventListener("mousedown",downListener);    
    }

    static HandleVerticalDragging(element:HTMLElement,listener:(dy:number)=>void,
        initialiser:()=>void){
        let initialMousePositionY  = {value:0};
        let positionDY = {value:0};        

        const moveListener =(e:MouseEvent)=>{     
            positionDY.value = e.clientY - initialMousePositionY.value;
            listener(positionDY.value);
        }
        const selectListener = (e:Event) => {
            e.preventDefault();
            return false
        };

        const downListener = (e:MouseEvent)=>{
            initialiser();
            initialMousePositionY.value = e.clientY;
            document.addEventListener("mousemove",moveListener);
            document.addEventListener("mouseup",upListener);
            document.addEventListener("selectstart",selectListener);
        }
        const upListener = ()=>{
            document.removeEventListener("mousemove",moveListener);
            document.removeEventListener("mouseup",upListener);
            document.removeEventListener("selectstart",selectListener);
            listener(positionDY.value);
        }        
        
        element.addEventListener("mousedown",downListener);    
    }

    static HandleDragging(element:HTMLElement,listener:(positionDiff:IPositionDiff)=>void,
        initialiser:()=>void){
            let initialMousePosition:IPositition  = {x:0,y:0};
            let positionDiff:IPositionDiff = {dx:0,dy:0};        
    
            const moveListener =(e:MouseEvent)=>{     
                positionDiff.dx = e.clientX - initialMousePosition.x;
                positionDiff.dy = e.clientY - initialMousePosition.y;
                listener(positionDiff);
            }
            const selectListener = (e:Event) => {
                e.preventDefault();
                return false
            };
    
            const downListener = (e:MouseEvent)=>{
                initialiser();
                initialMousePosition.x = e.clientX;
                initialMousePosition.y = e.clientY;
                document.addEventListener("mousemove",moveListener);
                document.addEventListener("mouseup",upListener);
                document.addEventListener("selectstart",selectListener);
            }
            const upListener = ()=>{
                document.removeEventListener("mousemove",moveListener);
                document.removeEventListener("mouseup",upListener);
                document.removeEventListener("selectstart",selectListener);
                listener(positionDiff);                
            }        
            
            element.addEventListener("mousedown",downListener);  
    }

    static JsxToHtml(jsx:JSX.Element){
        return ReactDOMServer.renderToStaticMarkup(jsx);
    }

    static addEventListenderByClassName<K extends keyof HTMLElementEventMap>(className:string,eventKey:K,listener:(target:HTMLElement,event:any)=>void){
        const elems = document.querySelectorAll<HTMLElement>(`.${className}`);
        
        elems.forEach((elem)=>{
            elem.addEventListener(eventKey,(e)=>{
                listener(elem,e);
            })
        })
    }

    static hasChanges(prevLines:string[],currentLines:string[]){
        if(prevLines.length != currentLines.length) return true;

        for(let i=0; i<prevLines.length; i++){
            if(prevLines[i] !== currentLines[i]) return true;
        }

        return false;
    }
}