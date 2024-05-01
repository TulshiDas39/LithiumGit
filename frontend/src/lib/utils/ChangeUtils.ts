import ReactDOMServer from "react-dom/server";
import { ILine } from "../interfaces";
import { Difference } from "../../components/selectedRepository/selectedRepoRight/changes/Difference";
import { EnumChangeGroup, IFile, IStatus } from "common_library";

export class ChangeUtils{
    static containerId = "";
    static file?:IFile;
    static currentLines:ILine[];
    static previousLines:ILine[];
    private static heighlightedLineIndexes:number[]=[];

    static showChanges(){
        const container = document.getElementById(`${ChangeUtils.containerId}`)!;

        const innerHtml = ReactDOMServer.renderToStaticMarkup(Difference({
            linesAfterChange:ChangeUtils.currentLines,
            linesBeforeChange:ChangeUtils.previousLines
        }));
        container.innerHTML = innerHtml;
        ChangeUtils.HandleScrolling();
        ChangeUtils.SetHeighlightedLines();
        ChangeUtils.FocusHightlightedLine(1);

        // ReduxUtils.resetChangeNavigation();
    }

    static FocusHightlightedLine(step:number){
        if(!ChangeUtils.containerId)
            return;
        const container = document.querySelector("#"+ChangeUtils.containerId);
        if(!ChangeUtils.heighlightedLineIndexes.length)
            return;
        const focusElem = container?.querySelector('.line_numbers')?.children[ChangeUtils.heighlightedLineIndexes[step-1]];
        focusElem?.scrollIntoView({block:"center"});
    }

    private static SetHeighlightedLines(){
        ChangeUtils.heighlightedLineIndexes = [];
        let lastItemHightlighted = false;
        if(!ChangeUtils.currentLines?.length || !ChangeUtils.previousLines?.length)
            return;
        const lenght = ChangeUtils.currentLines?.length;
        for(let i = 0;i < lenght; i++){
            if(ChangeUtils.currentLines?.[i].hightLightBackground || ChangeUtils.currentLines?.[i].text === undefined){
                if(!lastItemHightlighted) {
                    ChangeUtils.heighlightedLineIndexes.push(i);
                    lastItemHightlighted = true;
                }
            }
            else
                lastItemHightlighted = false;
        }
    }

    static get totalChangeCount(){
        return ChangeUtils.heighlightedLineIndexes.length;
    } 

    private static HandleScrolling(){
        if(ChangeUtils.previousLines !== null && ChangeUtils.currentLines !== null){
            const previousChangeScroll = document.querySelector(".difference .previous .content");
            const currentChangeScroll = document.querySelector(".difference .current .content");        
        
            let handler1 = (e:Event)=>{
                currentChangeScroll?.scrollTo({
                    left:previousChangeScroll?.scrollLeft,
                });
            }

            let handler2 = (e:Event)=>{
                previousChangeScroll?.scrollTo({                    
                    left:currentChangeScroll?.scrollLeft,
                });
            }

            if(previousChangeScroll && currentChangeScroll){
                previousChangeScroll.addEventListener("scroll",handler1)
                currentChangeScroll.addEventListener("scroll",handler2);
            }
        }
    }

    static ClearView(){
        const container = document.getElementById(`${ChangeUtils.containerId}`)!;
        if(container)
            container.innerHTML = "";
        ChangeUtils.file = undefined;
        //ReduxUtils.resetChangeNavigation();
    }

    static handleStatusChange(status:IStatus){
        const file = ChangeUtils.file!;
        if(!file || !ChangeUtils.containerId)
            return;

        if(file.changeGroup === EnumChangeGroup.UN_STAGED && !status.unstaged.some(_=>_.path === file.path)){
            ChangeUtils.ClearView();
        }
        else if(file.changeGroup === EnumChangeGroup.STAGED && !status.staged.some(_=>_.path === file.path)){
            ChangeUtils.ClearView();
        }
    }
}