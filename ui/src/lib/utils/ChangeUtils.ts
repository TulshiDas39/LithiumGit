import ReactDOMServer from "react-dom/server";
import { IFileProps, ILine } from "../interfaces";
import { Difference } from "../../components/selectedRepository/selectedRepoRight/changes/Difference";
import { IFile } from "common_library";
import { DifferencePreview } from "../../components/selectedRepository/selectedRepoRight/changes/DifferencePreview";

export class ChangeUtils{
    private containerId = "";
    file?:IFile;
    currentLines:ILine[]=[];
    previousLines:ILine[]=[];
    private heighlightedLineIndexes:number[]=[];

    constructor(containerId:string){
        this.containerId = containerId;
    }

    get ContainerId(){
        return this.containerId;
    }

    showChanges(){
        const container = document.getElementById(`${this.containerId}`)!;
        if(!container)
            return;
        const innerHtml = ReactDOMServer.renderToStaticMarkup(Difference({
            linesAfterChange:this.currentLines,
            linesBeforeChange:this.previousLines
        }));
        container.innerHTML = innerHtml;
        this.HandleScrolling();
        this.SetHeighlightedLines();

        // ReduxUtils.resetChangeNavigation();
    }

    showPreview(prevFileProps?:IFileProps,currentFileProps?:IFileProps){
        const container = document.getElementById(`${this.containerId}`)!;
        if(!container)
            return;
        const innerHtml = ReactDOMServer.renderToStaticMarkup(DifferencePreview({
            currentFileProps:currentFileProps,
            prevFileProps:prevFileProps,
        }));
        container.innerHTML = innerHtml;
    }

    FocusHightlightedLine(step:number){
        if(!this.containerId)
            return;
        const container = document.querySelector("#"+this.containerId);
        if(!this.heighlightedLineIndexes.length)
            return;
        const focusElem = container?.querySelector('.content')?.children[this.heighlightedLineIndexes[step-1]];
        focusElem?.scrollIntoView({block:"center"});
    }

    private SetHeighlightedLines(){
        this.heighlightedLineIndexes = [];
        let lastItemHightlighted = false;
        if(!this.currentLines?.length || !this.previousLines?.length)
            return;
        const lenght = this.currentLines?.length;
        for(let i = 0;i < lenght; i++){
            if(this.currentLines?.[i].hightLightBackground || this.currentLines?.[i].text === undefined){
                if(!lastItemHightlighted) {
                    this.heighlightedLineIndexes.push(i);
                    lastItemHightlighted = true;
                }
            }
            else
                lastItemHightlighted = false;
        }
    }

    get totalChangeCount(){
        return this.heighlightedLineIndexes.length;
    } 

    private HandleScrolling(){
        if(this.previousLines !== null && this.currentLines !== null){
            const previousChangeScroll = document.querySelector(`#${this.containerId} .difference .previous .content-container`);
            const currentChangeScroll = document.querySelector(`#${this.containerId} .difference .current .content-container`);
            const currentLineNumberScroll = document.querySelector(`#${this.containerId} .difference .current .line_numbers`);        
            const previousLineNumberScroll = document.querySelector(`#${this.containerId} .difference .previous .line_numbers`);
            const group1 = [currentChangeScroll,currentLineNumberScroll,previousLineNumberScroll];
            const group2 = [previousChangeScroll,currentLineNumberScroll,previousLineNumberScroll];
        //line_numbers
            let handler1 = (e:Event)=>{
                for(let g of group1){
                    g?.scrollTo({
                        left:previousChangeScroll?.scrollLeft,
                        top:previousChangeScroll?.scrollTop,
                    });
                }
                
            }

            let handler2 = (e:Event)=>{
                for(let g of group2){
                    g?.scrollTo({
                        left:currentChangeScroll?.scrollLeft,
                        top:currentChangeScroll?.scrollTop,
                    });
                }
            }

            if(previousChangeScroll && currentChangeScroll){
                previousChangeScroll.addEventListener("scroll",handler1)
                currentChangeScroll.addEventListener("scroll",handler2);
            }
        }
    }

    ClearView(){
        const container = document.getElementById(`${this.containerId}`)!;
        if(container)
            container.innerHTML = "";
        this.file = undefined;
        //ReduxUtils.resetChangeNavigation();
    }   
}