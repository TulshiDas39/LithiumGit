import ReactDOMServer from "react-dom/server";
import { EditorColors } from "../editor";
import { ILine } from "../interfaces";
import { DiffUtils } from "./DiffUtils";
import { DeltaStatic,Quill} from "quill";
import { Difference2 } from "../../components/selectedRepository/selectedRepoRight/changes/Difference2";
import { BranchGraphUtils } from "./BranchGraphUtils";
import { BranchUtils } from "./BranchUtils";

export class ChangeUtils{
    static containerId = "";
    static currentLines:ILine[];
    static previousLines:ILine[];

    static init(){
        var quill = new Quill('#editor', {
            theme: 'snow'
          });
    }

    static showChanges(){
        console.log("showing changes.");
        const container = document.getElementById(`${ChangeUtils.containerId}`)!;

        const innerHtml = ReactDOMServer.renderToStaticMarkup(Difference2({
            linesAfterChange:ChangeUtils.currentLines,
            linesBeforeChange:ChangeUtils.previousLines
        }));
        container.innerHTML = innerHtml;
        ChangeUtils.HandleScrolling();
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