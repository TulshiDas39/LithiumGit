import { EnumChangeType, ICommitInfo } from "common_library";
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

    static copy(value:string){
        navigator.clipboard.writeText(value);
    }

    static resolveHeight(id:string){        
        return new Promise<number>((res)=>{
            let tryCount = 0;
            const timer = setInterval(() => {
                tryCount++;
                if(tryCount > 1000){
                    clearInterval(timer);
                    res(0);
                }
                const elem = document.querySelector("#"+id);
                if(!elem)
                    return;
                const height = elem.getBoundingClientRect().height;
                if(!height)
                    return;
                clearInterval(timer);
                res(height);
            }, 200);
        })
        
    }

    static getChangeTypeHintColor(changeType:EnumChangeType){
        if(changeType === EnumChangeType.MODIFIED)
            return "text-primary";
        if(changeType === EnumChangeType.CREATED)
            return "text-success";
        if(changeType === EnumChangeType.DELETED)
            return "text-danger";
        return "text-info";
    }

    static getVerticalScrollRatio(element:HTMLElement){
        const height = element.getBoundingClientRect().height;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        return scrollTop / (scrollHeight - height);
    }

    static getVerticalScrollTop(element:HTMLElement,ratio:number){
        const height = element.getBoundingClientRect().height;
        const scrollHeight = element.scrollHeight;
        const scrollTop = (scrollHeight - height)*ratio;
        return scrollTop;
    }

    static resolveValueFromId(id:string){
        const lastIndex = id.lastIndexOf("_");
        return id.substring(lastIndex+1);
    }

    static jsx_to_domElement<T extends HTMLElement>(jsx:JSX.Element){
        var wrapper= document.createElement('div');
        wrapper.innerHTML= ReactDOMServer.renderToStaticMarkup(jsx);
        return wrapper.firstChild as T;
    }

    static getTimeZonOffsetStr(){
        const offset = - new Date().getTimezoneOffset()/60;
        const sign = offset < 0?"-" : "+";
        return `UTC ${sign} ${offset}`;
    }

    static openContextModal=()=>{};

}