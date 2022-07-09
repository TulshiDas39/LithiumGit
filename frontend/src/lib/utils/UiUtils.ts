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

    static test(x:number) {
        const panelWidth = 864;
        const viewBoxWidth = 1144;
        const horizontalScrollBarWidth = 54.85105438401776;
        const totalWidth = 18020;

        const scrollableWidth =809.14894561598;// panelWidth - horizontalScrollBarWidth;

        let initialX = 1000;

        const mouseMoveX = x;//100;

        // 864px scroll move korle svg move hoi 1144px
        //100px scroll move korle svg move hoi 100*(1144/864)px // equation x*(viewBoxWidth/panelWidth)

        //totalWidth svg move e scroll move hoi scrollableWidth px
        //

        const expectedMovedScrollBar = 100 * (viewBoxWidth / panelWidth) * (scrollableWidth / totalWidth);
        const realMovedScrollBar = 5.945466930935044;

        console.log("expectedMovedScrollBar", expectedMovedScrollBar);
        //864 px mouse move korle horizontal scroll move hoi 51.36883428328// from experiment

        ///18020 px svg move korle scroll move hoi 809.14894561598 px 
        //1144 px svg move korle scroll move hoi 1144 * (809.14894561598/18020)
        
        
        
        // initial x =17430.435185185182
        // final x= 16290.407407407405

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

    static JsxToHtml(jsx:JSX.Element){
        return ReactDOMServer.renderToStaticMarkup(jsx);
    }
}