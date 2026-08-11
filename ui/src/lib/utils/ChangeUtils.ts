import ReactDOMServer from "react-dom/server";
import { ILine } from "../interfaces";
import { Difference } from "../../components/selectedRepository/selectedRepoRight/changes/Difference";
import { IFile, IFileProps } from "common_library";
import { DifferencePreview } from "../../components/selectedRepository/selectedRepoRight/changes/DifferencePreview";
import { DiffView } from "../../components/selectedRepository/selectedRepoRight/changes/DiffView";

export class ChangeUtils{
    private containerId = "";
    file?:IFile;
    currentLines:ILine[]=[];
    previousLines:ILine[]=[];
    private heighlightedLineIndexes:number[]=[];
    private scrollHandler1?: (e: Event) => void;
    private scrollHandler2?: (e: Event) => void;
    private currentScrollableContainer?:HTMLElement;
    private previousScrollableContainer?:HTMLElement;


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

    updatePreviousChanges(lines:ILine[]){
        this.previousLines = lines;
        const container = document.querySelector(`#${this.containerId} .difference .previous`);
        const innerHtml = ReactDOMServer.renderToStaticMarkup(DiffView({changeType:"previous",lines:this.previousLines}));
        container!.innerHTML = innerHtml;
        this.HandleScrolling();
        this.previousScrollableContainer?.scrollTo({
            top:this.currentScrollableContainer?.scrollTop,
            left:this.currentScrollableContainer?.scrollLeft,
        });
        this.SetHeighlightedLines();
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
        let ilines = this.currentLines?.length ? this.currentLines : this.previousLines;
        if(!ilines?.length)
            return;
        const lenght = ilines?.length;
        for(let i = 0;i < lenght; i++){
            if(ilines?.[i].hightLightBackground || ilines?.[i].text === undefined){
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
        if(this.previousLines !== null || this.currentLines !== null){
            const previousChangeScroll = document.querySelector(`#${this.containerId} .difference .previous .content-container`);
            this.previousScrollableContainer = previousChangeScroll as HTMLElement;
            const currentChangeScroll = document.querySelector(`#${this.containerId} .difference .current .content-container`)!;
            this.currentScrollableContainer = currentChangeScroll as HTMLElement;
            const currentLineNumberScroll = document.querySelector(`#${this.containerId} .difference .current .line_numbers`);        
            const previousLineNumberScroll = document.querySelector(`#${this.containerId} .difference .previous .line_numbers`);
            const group1 = [currentChangeScroll,currentLineNumberScroll,previousLineNumberScroll];
            const group2 = [previousChangeScroll,currentLineNumberScroll,previousLineNumberScroll];
            if(this.scrollHandler1){
                previousChangeScroll?.removeEventListener("scroll",this.scrollHandler1);
            }
            this.scrollHandler1 = (e:Event)=>{
                for(let g of group1){
                    g?.scrollTo({
                        left:previousChangeScroll?.scrollLeft,
                        top:previousChangeScroll?.scrollTop,
                    });
                }
                
            }

            if(this.scrollHandler2){
                currentChangeScroll?.removeEventListener("scroll",this.scrollHandler2);
            }
            this.scrollHandler2 = (e:Event)=>{
                for(let g of group2){
                    g?.scrollTo({
                        left:currentChangeScroll?.scrollLeft,
                        top:currentChangeScroll?.scrollTop,
                    });
                }
            }
           

            if(previousChangeScroll){
                previousChangeScroll.addEventListener("scroll",this.scrollHandler1)
            }
            if(currentChangeScroll){
                currentChangeScroll.addEventListener("scroll",this.scrollHandler2);
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