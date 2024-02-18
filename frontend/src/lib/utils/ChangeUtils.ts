import ReactDOMServer from "react-dom/server";
import { EditorColors } from "../editor";
import { ILine } from "../interfaces";
import { DiffUtils } from "./DiffUtils";
import { DeltaStatic,Quill} from "quill";
import { Difference2 } from "../../components/selectedRepository/selectedRepoRight/changes/Difference2";
import { BranchGraphUtils } from "./BranchGraphUtils";
import { BranchUtils } from "./BranchUtils";
import { ReduxUtils } from "./ReduxUtils";

export class ChangeUtils{
    static containerId = "";
    static currentLines:ILine[];
    static previousLines:ILine[];
    private static heighlightedLineIndexes:number[]=[];

    static init(){
        var quill = new Quill('#editor', {
            theme: 'snow'
          });
    }

    static showChanges(){
        const container = document.getElementById(`${ChangeUtils.containerId}`)!;

        const innerHtml = ReactDOMServer.renderToStaticMarkup(Difference2({
            linesAfterChange:ChangeUtils.currentLines,
            linesBeforeChange:ChangeUtils.previousLines
        }));
        container.innerHTML = innerHtml;
        ChangeUtils.HandleScrolling();
        ChangeUtils.SetHeighlightedLines();
    }

    static FocusHightlightedLine(step:number){
        const container = document.querySelector("#"+ChangeUtils.containerId);
        const focusElem = container?.querySelector('.line_numbers')?.children[ChangeUtils.heighlightedLineIndexes[step-1]];
        focusElem?.scrollIntoView({block:"center"});
    }

    private static SetHeighlightedLines(){
        ChangeUtils.heighlightedLineIndexes = [];
        let lastItemHightlighted = false;
        for(let i = 0;i < ChangeUtils.currentLines.length; i++){
            if(ChangeUtils.currentLines?.[i].hightLightBackground || ChangeUtils.previousLines?.[i].hightLightBackground){
                if(!lastItemHightlighted) {
                    ChangeUtils.heighlightedLineIndexes.push(i);
                    lastItemHightlighted = true;
                }
            }
            else
                lastItemHightlighted = false;
        }
        ReduxUtils.resetChangeNavigation();
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
}