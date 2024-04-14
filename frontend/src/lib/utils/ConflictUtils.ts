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
    
    static GetUiLinesOfConflict(contentLines: string[]) {
        const currentMarker = "<<<<<<< HEAD";
        const endingMarker = ">>>>>>>";
        const separator = "=======";
    
        const currentLines:ILine[] = [];
        const previousLines:ILine[] = [];
        let conflictNo = 0;
        let currentChangeDetected = false;
        let incomingChangeDetected = false;
        for(const contentLine of contentLines){
            if(contentLine === currentMarker){
                conflictNo++;
                currentChangeDetected = true;
                incomingChangeDetected = false;
                continue;
            }
            if(contentLine === separator){
                currentChangeDetected = false;
                incomingChangeDetected = true;
                continue;
            }
            if(contentLine.startsWith(endingMarker)){
                currentChangeDetected = false;
                incomingChangeDetected = false;
                while(currentLines.length > previousLines.length){
                    previousLines.push({textHightlightIndex:[]});
                }
                while(currentLines.length < previousLines.length){
                    currentLines.push({textHightlightIndex:[]});
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

        const editorTopHtml = ReactDOMServer.renderToStaticMarkup(ConflictTopPanel({
            currentLines:ConflictUtils.currentLines,
            previousLines:ConflictUtils.previousLines,
        }));

        const editorBottomHtml = ReactDOMServer.renderToStaticMarkup(ConflictBottomPanel({
            currentLines:ConflictUtils.currentLines,
            previousLines:ConflictUtils.previousLines,
        }));

        topPanel.innerHTML = editorTopHtml;
        bottomPanel.innerHTML = editorBottomHtml;
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
}