import { ICommitInfo } from "common_library";
import { IPositition } from "../interfaces";
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

    static HandleHorizontalDragging(element:HTMLElement,listener:(initialPosition:number,currentPosition:number)=>void,
        initialiser:()=>void){
        let initialMousePositionX  = {value:-1};
        let currentMousePositionX = {value:-1};
        if(!element)
            return;

        const moveListener =(e:MouseEvent)=>{     
            currentMousePositionX.value = e.clientX;
            listener(initialMousePositionX.value,currentMousePositionX.value);
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
            listener(initialMousePositionX.value, currentMousePositionX.value);
            currentMousePositionX.value = -1;
        }        
        
        element?.addEventListener("mousedown",downListener);    
    }

    static HandleVerticalDragging(element:HTMLElement,listener:(initialPosition:number,currentPosition:number,mouseReleased?:boolean)=>void,
        initialiser:()=>void){
        let initialMousePositionY  = {value:-1};
        let currentMousePositionY = {value:-1};        

        const moveListener =(e:MouseEvent)=>{     
            currentMousePositionY.value = e.clientY;
            listener(initialMousePositionY.value,currentMousePositionY.value);
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
            listener(initialMousePositionY.value, currentMousePositionY.value,true);
            currentMousePositionY.value = -1;
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