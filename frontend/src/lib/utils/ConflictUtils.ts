import { IFile } from "common_library";
import { ILine } from "../interfaces";
import { EnumHtmlIds } from "../enums";
import ReactDOMServer from "react-dom/server";
import { ConflictTopPanel } from "../../components/selectedRepository/selectedRepoRight/changes/ConflictTopPanel";
import { ConflictBottomPanel } from "../../components/selectedRepository/selectedRepoRight/changes/ConflictBottomPanel";

export class ConflictUtils{
    static readonly topPanelId = EnumHtmlIds.ConflictEditorTopPanel;
    static readonly bottomPanelId = EnumHtmlIds.ConflictEditorBottomPanel;
    static file?:IFile;
    static currentLines:ILine[];
    static previousLines:ILine[];
    private static heighlightedLineIndexes:number[]=[];
    private static startingMarkers:{conflictNo:number;text:string}[] = [];
    private static endingMarkers:{conflictNo:number;text:string}[] = [];
    private static currentLineDivWidth = 0;
    private static previousLineDivWidth = 0;

    static get TotalConflict(){
        return ConflictUtils.startingMarkers.length;
    }
    static get Separator(){
        return "=======";
    }

    static GetEndingMarkerText(conflictNo:number){
        return ConflictUtils.endingMarkers.find(_ => _.conflictNo === conflictNo);
    }
    
    static GetUiLinesOfConflict(contentLines: string[]) {
        const currentMarker = "<<<<<<< HEAD";
        const endingMarker = ">>>>>>>";
        
    
        const currentLines:ILine[] = [];
        const previousLines:ILine[] = [];
        let conflictNo = 0;
        let currentChangeDetected = false;
        let incomingChangeDetected = false;
        for(const contentLine of contentLines){
            if(contentLine.startsWith(currentMarker)){
                conflictNo++;
                currentChangeDetected = true;
                incomingChangeDetected = false;
                ConflictUtils.startingMarkers.push({conflictNo,text:contentLine});
                continue;
            }
            if(contentLine === ConflictUtils.Separator){
                currentChangeDetected = false;
                incomingChangeDetected = true;
                continue;
            }
            if(contentLine.startsWith(endingMarker)){
                currentChangeDetected = false;
                incomingChangeDetected = false;
                ConflictUtils.endingMarkers.push({conflictNo,text:contentLine});
                while(currentLines.length > previousLines.length){
                    previousLines.push({textHightlightIndex:[],conflictNo});
                }
                while(currentLines.length < previousLines.length){
                    currentLines.push({textHightlightIndex:[],conflictNo});
                }                
                continue;
            }
            if(currentChangeDetected){
                currentLines.push({
                    text:contentLine,
                    hightLightBackground:true,
                    textHightlightIndex:[],
                    conflictNo
                });
                continue;
            }
            if(incomingChangeDetected){
                previousLines.push({
                    text:contentLine,
                    hightLightBackground:true,
                    textHightlightIndex:[],
                    conflictNo
                });
                continue;
            }
            previousLines.push({
                text:contentLine,
                textHightlightIndex:[],
            })
            currentLines.push({
                text:contentLine,
                textHightlightIndex:[],
            })            
        }
        return {currentLines,previousLines};
    }

    static ShowEditor(){
        if(!ConflictUtils.currentLines || !ConflictUtils.previousLines)
            return;

        const topPanel = document.getElementById(`${ConflictUtils.topPanelId}`)!;
        const bottomPanel = document.getElementById(`${ConflictUtils.bottomPanelId}`)!;
        
        console.log("topPanel",topPanel);
        console.log("bottomPanel",bottomPanel);

        if(!topPanel || !bottomPanel)
            return;

        ConflictUtils.currentLineDivWidth = ((ConflictUtils.currentLines.filter(_=> _.text !== undefined).length)+"").length + 3;
        ConflictUtils.previousLineDivWidth = ((ConflictUtils.previousLines.filter(_=> _.text !== undefined).length)+"").length + 3;

        const editorTopHtml = ReactDOMServer.renderToStaticMarkup(ConflictTopPanel({
            currentLines:ConflictUtils.currentLines,
            currentLineDivWidth: ConflictUtils.currentLineDivWidth,
            previousLines:ConflictUtils.previousLines,
            previousLineDivWidth:ConflictUtils.previousLineDivWidth,
        }));

        const editorBottomHtml = ReactDOMServer.renderToStaticMarkup(ConflictBottomPanel({
            currentLines:ConflictUtils.currentLines,
            previousLines:ConflictUtils.previousLines,
        }));

        topPanel.innerHTML = editorTopHtml;
        bottomPanel.innerHTML = editorBottomHtml;

        //ConflictUtils.HandleScrolling();
        ConflictUtils.purgeEditorUi();

        ConflictUtils.SetHeighlightedLines();
    }

    private static purgeEditorUi(){
        const elem = document.querySelector('.check_all_incoming') as HTMLElement;
        if(elem)
            elem.style.width = `${ConflictUtils.previousLineDivWidth}ch`;
        const elem2 = document.querySelector('.check_all_current') as HTMLElement;
        if(elem2)
            elem2.style.width = `${ConflictUtils.currentLineDivWidth}ch`;

    }

    static get totalChangeCount(){
        return ConflictUtils.heighlightedLineIndexes.length;
    }

    private static HandleScrolling(){
        if(ConflictUtils.previousLines !== null && ConflictUtils.currentLines !== null){
            const previousChangeScroll = document.querySelector(".conflict-diff .previous .content");
            const currentChangeScroll = document.querySelector(".conflict-diff .current .content");        
        
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

    private static SetHeighlightedLines(){
        ConflictUtils.heighlightedLineIndexes = [];
        let lastItemHightlighted = false;        
        const lenght = ConflictUtils.currentLines?.length || ConflictUtils.previousLines?.length || 0;
        for(let i = 0;i < lenght; i++){
            if(ConflictUtils.currentLines?.[i].hightLightBackground || ConflictUtils.previousLines?.[i].hightLightBackground){
                if(!lastItemHightlighted) {
                    ConflictUtils.heighlightedLineIndexes.push(i);
                    lastItemHightlighted = true;
                }
            }
            else
                lastItemHightlighted = false;
        }
    }

    static FocusHightlightedLine(step:number){        
        const container = document.querySelector("#"+ConflictUtils.topPanelId);
        if(!ConflictUtils.heighlightedLineIndexes.length)
            return;
        const focusElem = container?.querySelector('.line_numbers')?.children[ConflictUtils.heighlightedLineIndexes[step-1]];
        focusElem?.scrollIntoView({block:"center"});
    }
}