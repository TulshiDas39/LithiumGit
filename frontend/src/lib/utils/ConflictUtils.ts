import { EnumConflictSide, IActionTaken, IFile } from "common_library";
import { ILine } from "../interfaces";
import { EnumHtmlIds } from "../enums";
import ReactDOMServer from "react-dom/server";
import { ConflictTopPanel } from "../../components/selectedRepository/selectedRepoRight/changes/ConflictTopPanel";
import { ConflictBottomPanel } from "../../components/selectedRepository/selectedRepoRight/changes/ConflictBottomPanel";
import { UiUtils } from "./UiUtils";
import { DiffUtils } from "./DiffUtils";
import { NumUtils } from "./NumUtils";

export class ConflictUtils{
    static readonly topPanelId = EnumHtmlIds.ConflictEditorTopPanel;
    static readonly bottomPanelId = EnumHtmlIds.ConflictEditorBottomPanel;
    static file?:IFile;
    static currentLines:ILine[];
    static incomingLines:ILine[];
    private static heighlightedLineIndexes:number[]=[];
    private static startingMarkers:{conflictNo:number;text:string}[] = [];
    private static endingMarkers:{conflictNo:number;text:string}[] = [];
    private static currentLineDivWidth = 0;
    private static previousLineDivWidth = 0;
    private static hoverTopPanel = false;
    private static hoverBottomPanel = false;
    private static actionsTaken:IActionTaken[] = [];
    private static currentEditorWidth = 0;
    private static incomingEditorWidth = 0;
    private static topPanel?:HTMLDivElement;
    private static bottomPanel?:HTMLDivElement;

    static get Actions(){
        return ConflictUtils.actionsTaken;
    }

    static get TotalConflict(){
        const conflictNos = ConflictUtils.currentLines.filter(_=> !!_.conflictNo).map(_=>_.conflictNo!);
        return NumUtils.max(conflictNos);
    }
    static get Separator(){
        return "=======";
    }

    static get CurrentEditorWidth(){
        return ConflictUtils.currentEditorWidth;
    }

    static get IncomingEditorWidth(){
        return ConflictUtils.incomingEditorWidth;
    }

    static GetEndingMarkerText(conflictNo:number){
        return ConflictUtils.endingMarkers.find(_ => _.conflictNo === conflictNo);
    }

    private static setEditorWidths(){
        ConflictUtils.currentEditorWidth = DiffUtils.getEditorWidth(ConflictUtils.currentLines.map(x=>x.text?x.text:""));
        ConflictUtils.incomingEditorWidth = DiffUtils.getEditorWidth(ConflictUtils.incomingLines.map(x=>x.text?x.text:""));
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

    private static resetData(){
        ConflictUtils.setEditorWidths();
        ConflictUtils.topPanel = document.querySelector<HTMLDivElement>(`#${ConflictUtils.topPanelId}`)!;
        ConflictUtils.bottomPanel = document.querySelector<HTMLDivElement>(`#${ConflictUtils.bottomPanelId}`)!;
        ConflictUtils.hoverBottomPanel = false;
        ConflictUtils.hoverTopPanel = false;
        ConflictUtils.actionsTaken = [];
        ConflictUtils.acceptAllCurrentCheckBox.checked = false;
        ConflictUtils.acceptAllIncomingCheckBox.checked = false;

    }

    private static getConflictNo(id:string){
        const value = UiUtils.resolveValueFromId(id);
        return value;
    }

    static ShowEditor(){
        if(!ConflictUtils.currentLines || !ConflictUtils.incomingLines)
            return;

        const topPanel = document.getElementById(`${ConflictUtils.topPanelId}`)!;
        const bottomPanel = document.getElementById(`${ConflictUtils.bottomPanelId}`)!;              

        if(!topPanel || !bottomPanel)
            return;
        ConflictUtils.resetData();
        ConflictUtils.currentLineDivWidth = ((ConflictUtils.currentLines.filter(_=> _.text !== undefined).length)+"").length + 3;
        ConflictUtils.previousLineDivWidth = ((ConflictUtils.incomingLines.filter(_=> _.text !== undefined).length)+"").length + 3;

        const editorTopHtml = ReactDOMServer.renderToStaticMarkup(ConflictTopPanel({
            currentLines:ConflictUtils.currentLines,
            currentLineDivWidth: ConflictUtils.currentLineDivWidth,
            previousLines:ConflictUtils.incomingLines,
            previousLineDivWidth:ConflictUtils.previousLineDivWidth,
        }));

        const editorBottomHtml = ReactDOMServer.renderToStaticMarkup(ConflictBottomPanel({
            currentLines:ConflictUtils.currentLines,
            previousLines:ConflictUtils.incomingLines,
        }));

        topPanel.innerHTML = editorTopHtml;
        bottomPanel.innerHTML = editorBottomHtml;

        ConflictUtils.addEventHanlders();
        ConflictUtils.HandleScrolling();
        ConflictUtils.purgeEditorUi();

        ConflictUtils.SetHeighlightedLines();
    }

    private static get topPanelElement(){
        const conflictTop = document.querySelector(".conflict-diff") as HTMLDivElement;
        return conflictTop;
    }

    private static get bottomPanelElement(){
        const conflictBottom = document.querySelector(".conflict-bottom") as HTMLDivElement;
        return conflictBottom;
    }

    private static get incomingCheckBoxes(){
        const checkboxes = document.querySelectorAll<HTMLInputElement>(".conflict-diff .previous input");
        return checkboxes;
    }

    private static get currentCheckBoxes(){
        const checkboxes = document.querySelectorAll<HTMLInputElement>(".conflict-diff .current input");
        return checkboxes;
    }

    private static get acceptAllIncomingCheckBox(){
        return document.querySelector(`#${EnumHtmlIds.accept_all_incoming}`) as HTMLInputElement;
    }

    private static get acceptAllCurrentCheckBox(){
        return document.querySelector(`#${EnumHtmlIds.accept_all_current}`) as HTMLInputElement;
    }

    private static get acceptIncomingElems(){
        return document.querySelectorAll<HTMLSpanElement>(`.accept_incoming`);
    }

    private static get acceptCurrentElems(){
        return document.querySelectorAll<HTMLSpanElement>(`.accept_current`);
    }

    private static get acceptBothElems(){
        return document.querySelectorAll<HTMLSpanElement>(`.accept_both`);
    }

    private static addEventHanlders(){
        const conflictTop = ConflictUtils.topPanelElement;
        const conflictBottom = ConflictUtils.bottomPanelElement;
        conflictTop.addEventListener("mouseenter",()=>{
            ConflictUtils.hoverTopPanel = true;
            ConflictUtils.hoverBottomPanel = false;
        })
        conflictBottom.addEventListener("mouseenter",()=>{
            ConflictUtils.hoverTopPanel = false;
            ConflictUtils.hoverBottomPanel = true;
        })
        const acceptAllIncomingCheck = ConflictUtils.acceptAllIncomingCheckBox;
        acceptAllIncomingCheck.addEventListener("change",(e)=>{
            const checked = !!acceptAllIncomingCheck.checked;
            const checkboxes = ConflictUtils.incomingCheckBoxes;
            checkboxes.forEach(elem => {
                if(elem.checked !== checked){
                    elem.checked = checked;
                    const conflictNo  = Number(UiUtils.resolveValueFromId(elem.id));
                    ConflictUtils.updateConflictState(conflictNo);
                }
            });
        })

        const acceptAllCurrentCheck = ConflictUtils.acceptAllCurrentCheckBox;
        acceptAllCurrentCheck.addEventListener("change",(e)=>{
            const checked = !!acceptAllCurrentCheck.checked;
            const checkboxes = ConflictUtils.currentCheckBoxes;
            checkboxes.forEach(elem => {
                if(elem.checked !== checked){
                    elem.checked = checked;
                    const conflictNo  = Number(UiUtils.resolveValueFromId(elem.id));
                    ConflictUtils.updateConflictState(conflictNo);
                }
            });
        })

        const incomingCheckBoxes = ConflictUtils.incomingCheckBoxes;
        incomingCheckBoxes.forEach(elem=>{
            elem.addEventListener("change",(e)=>{
                ConflictUtils.updateTopLabelIncomingCheckboxState();
                const conflictNo = Number(UiUtils.resolveValueFromId(elem.id));
                ConflictUtils.updateConflictState(conflictNo);
            })
        })

        const currentCheckBoxes = ConflictUtils.currentCheckBoxes;
        currentCheckBoxes.forEach(elem=>{
            elem.addEventListener("change",(e)=>{
                ConflictUtils.updateTopLeveCurrentCheckboxState();
                const conflictNo = Number(UiUtils.resolveValueFromId(elem.id));
                ConflictUtils.updateConflictState(conflictNo);
            })
        })

        ConflictUtils.acceptIncomingElems.forEach(elem=>{
            elem.addEventListener("click",()=>{
                const conflictNo  = Number(UiUtils.resolveValueFromId(elem.id));
                ConflictUtils.handleAcceptIncoming(conflictNo);
            })
        })

        ConflictUtils.acceptCurrentElems.forEach(elem=>{
            elem.addEventListener("click",()=>{
                const conflictNo  = Number(UiUtils.resolveValueFromId(elem.id));
                ConflictUtils.handleAcceptCurrent(conflictNo);
            })
        })

        ConflictUtils.acceptBothElems.forEach(elem=>{
            elem.addEventListener("click",()=>{
                const conflictNo  = Number(UiUtils.resolveValueFromId(elem.id));
                ConflictUtils.handleAcceptCurrent(conflictNo);
                ConflictUtils.handleAcceptIncoming(conflictNo);
            })
        })

    }

    private static handleAcceptIncoming(conflictNo:number){
        const checkBoxes = ConflictUtils.getCheckboxesByConflict(conflictNo);
        checkBoxes.incomingCheckBox.checked = true;        
        ConflictUtils.updateTopLabelIncomingCheckboxState();        
        ConflictUtils.updateConflictState(conflictNo);
    }

    private static handleAcceptCurrent(conflictNo:number){
        const checkBoxes = ConflictUtils.getCheckboxesByConflict(conflictNo);
        checkBoxes.currentCheckBoxe.checked = true;        
        ConflictUtils.updateTopLeveCurrentCheckboxState();        
        ConflictUtils.updateConflictState(conflictNo);
    }

    private static getIncomingCheckboxByConflict(conflictNo:number){
        return document.querySelector(`#${EnumConflictSide.Incoming}_${conflictNo}`) as HTMLInputElement;
    }

    private static getCurrentCheckboxByConflict(conflictNo:number){
        return document.querySelector(`#${EnumConflictSide.Current}_${conflictNo}`) as HTMLInputElement;
    }

    private static getCurrentLineElementsByConflict(conflictNo:number){
        return document.querySelectorAll<HTMLParagraphElement>(`.${EnumConflictSide.Current}_${conflictNo}`);
    }

    private static getIncomingLineElementsByConflict(conflictNo:number){
        return document.querySelectorAll<HTMLParagraphElement>(`.${EnumConflictSide.Incoming}_${conflictNo}`);
    }

    private static getCheckboxesByConflict(conflictNo:number){
        const incomingCheckBox = ConflictUtils.getIncomingCheckboxByConflict(conflictNo);
        const currentCheckBoxe = ConflictUtils.getCurrentCheckboxByConflict(conflictNo);
        return {incomingCheckBox,currentCheckBoxe};
    }

    private static getContentLinesByConflict(conflictNo:number){
        const incomingLines = document.querySelectorAll(`.incoming.content.conflictNo_${conflictNo}`);
        const currentLines = document.querySelectorAll(`.current.content.conflictNo_${conflictNo}`);
        return {
            incomingLines,
            currentLines
        }
    }

    private static updateTopPanelState(conflictNo:number){
        const checkboxes = ConflictUtils.getCheckboxesByConflict(conflictNo);
        const currentLineElements = ConflictUtils.getCurrentLineElementsByConflict(conflictNo);
        const incomingLineElements = ConflictUtils.getIncomingLineElementsByConflict(conflictNo);
        if(checkboxes.currentCheckBoxe.checked){
            currentLineElements.forEach(elem=> elem.classList.remove("bg-fade","bg-current-change"));
            currentLineElements.forEach(elem=> elem.classList.add("bg-change-accepted"));
        }
        else if(!checkboxes.currentCheckBoxe.checked){
            currentLineElements.forEach(elem=> elem.classList.add("bg-fade"));
            currentLineElements.forEach(elem=> elem.classList.remove("bg-current-change","bg-change-accepted"));
        }

        if(checkboxes.incomingCheckBox.checked){
            incomingLineElements.forEach(elem=> elem.classList.remove("bg-fade","bg-previous-change"));
            incomingLineElements.forEach(elem=> elem.classList.add("bg-change-accepted"));            
        }
        else if(!checkboxes.incomingCheckBox.checked){
            incomingLineElements.forEach(elem=> elem.classList.add("bg-fade"));
            incomingLineElements.forEach(elem=> elem.classList.remove("bg-previous-change","bg-change-accepted"));
        }
    }

    private static moveDownIncomingChange(conflictNo:number){
        const contentLines = ConflictUtils.getContentLinesByConflict(conflictNo);
        if(!contentLines.incomingLines.length)
            return;
        const firstItem = contentLines.incomingLines.item(0);
        contentLines.currentLines.forEach(elem=> firstItem.parentNode!.insertBefore(elem,firstItem));
        firstItem.classList.add("border-top");
    }

    private static moveDownCurrentChange(conflictNo:number){
        const contentLines = ConflictUtils.getContentLinesByConflict(conflictNo);
        if(!contentLines.currentLines.length)
            return;
        const firstItem = contentLines.currentLines.item(0);
        contentLines.incomingLines.forEach(elem=> firstItem.parentNode!.insertBefore(elem,firstItem));
        firstItem.classList.add("border-top");
    }

    private static updateBottomPanelState(conflictNo:number){
        let action = ConflictUtils.actionsTaken.find(_=> _.conflictNo === conflictNo);
        let newAction = false;
        if(!action){
            action = {
                conflictNo,
                taken:[]
            };
            ConflictUtils.actionsTaken.push(action);
            newAction = true;
        }
        
        const bottomPanel = ConflictUtils.bottomPanelElement;        
            
        const checkboxes = ConflictUtils.getCheckboxesByConflict(conflictNo);
        const markers = document.querySelectorAll(`.marker.conflictNo_${conflictNo}`);
        markers.forEach(elm=> elm.parentNode!.removeChild(elm));
        
        const lineContainer = bottomPanel.querySelector('.line-container')!;
        if(newAction){
            const nonLineNumberElems = lineContainer.querySelectorAll(`.noLine.conflictNo_${conflictNo}`);
            nonLineNumberElems.forEach(elm => elm.parentNode!.removeChild(elm));
            const lastLineElem = lineContainer.querySelector(`.lineNo:last-child`);
            lastLineElem?.parentNode?.removeChild(lastLineElem);
        }        
        
        if(newAction){            
            lineContainer.removeChild(lineContainer.lastChild!);
            lineContainer.removeChild(lineContainer.lastChild!);
        }

        const contentLines = ConflictUtils.getContentLinesByConflict(conflictNo);
        const incomingContentLines = contentLines.incomingLines;
        //const lineNumberParent = bottomPanel.querySelector('.lineNo')?.parentElement!;
        if(checkboxes.incomingCheckBox.checked){
            if(!action.taken.includes(EnumConflictSide.Incoming)){
                action.taken.push(EnumConflictSide.Incoming);
                if(!newAction){
                    incomingContentLines.forEach(_=>{
                        lineContainer.querySelector('.d-none.lineNo')?.classList.remove('d-none');
                    })
                }
            }
            incomingContentLines.forEach(elem => {
                elem.classList.remove("d-none","bg-previous-change");
                elem.classList.add("bg-change-accepted");                
            });
        }
        else{
            if(action.taken.includes(EnumConflictSide.Incoming) || newAction){
                const lineElems = lineContainer.querySelectorAll('.lineNo:not(.d-none)');
                const lineElemLen = lineElems.length;
                let i = 1;
                incomingContentLines.forEach((_)=>{
                    lineElems.item(lineElemLen-i).classList.add('d-none');
                    i++;
                })                
            }            
            action.taken = action.taken.filter(_ => _ !== EnumConflictSide.Incoming);
            incomingContentLines.forEach(elem=> elem.classList.add("d-none"));
        }

        const currentContentLines = contentLines.currentLines;
        if(checkboxes.currentCheckBoxe.checked){
            if(!action.taken.includes(EnumConflictSide.Current)){
                action.taken.push(EnumConflictSide.Current);
                if(!newAction){
                    currentContentLines.forEach(_=>{
                        lineContainer.querySelector('.d-none.lineNo')?.classList.remove('d-none');
                    })
                }
            }
            currentContentLines.forEach(elem=> {
                elem.classList.remove("d-none","bg-current-change");
                elem.classList.add("bg-change-accepted");
            });
        }
        else{
            if(action.taken.includes(EnumConflictSide.Current) || newAction){
                const lineElems = lineContainer.querySelectorAll('.lineNo:not(.d-none)');
                const lineElemLen = lineElems.length;
                let i = 1;
                currentContentLines.forEach((_)=>{
                    lineElems.item(lineElemLen-i).classList.add('d-none');
                    i++;
                })
            }  
            action.taken = action.taken.filter(_ => _ !== EnumConflictSide.Current);
            currentContentLines.forEach(elem=> elem.classList.add("d-none"));
        }

        if(action.taken.length === 2){
            if(action.taken[1] === EnumConflictSide.Current)
                ConflictUtils.moveDownCurrentChange(conflictNo);
            else
                ConflictUtils.moveDownIncomingChange(conflictNo);
        }
    }

    static dispatchResolvedCount = (resolvedConflict:number)=>{}

    private static updateConflictState(conflictNo:number){
        ConflictUtils.updateTopPanelState(conflictNo);
        ConflictUtils.updateBottomPanelState(conflictNo);
        ConflictUtils.dispatchResolvedCount(ConflictUtils.Actions.length);
        //ReduxUtils.dispatch(ActionConflict.updateData({}))
    }

    private static updateTopLabelIncomingCheckboxState(){
        const topLevelCheckBox = ConflictUtils.acceptAllIncomingCheckBox;
        const checkboxes = ConflictUtils.incomingCheckBoxes;
        let selectionCount = 0;
        checkboxes.forEach(_=>{
            if(_.checked)
                selectionCount++;
        });

        if(selectionCount === checkboxes.length){
            topLevelCheckBox.checked = true;
            topLevelCheckBox.indeterminate = false;            
        }
        else if(selectionCount > 0){
            topLevelCheckBox.checked = false;
            topLevelCheckBox.indeterminate = true;
        }
        else{
            topLevelCheckBox.checked = false;
            topLevelCheckBox.indeterminate = false;
        }
    }

    private static updateTopLeveCurrentCheckboxState(){
        const topLevelCheckBox = ConflictUtils.acceptAllCurrentCheckBox;
        const checkboxes = ConflictUtils.currentCheckBoxes;
        let selectionCount = 0;
        checkboxes.forEach(_=>{
            if(_.checked)
                selectionCount++;
        });

        if(selectionCount === checkboxes.length){
            topLevelCheckBox.checked = true;
            topLevelCheckBox.indeterminate = false;            
        }
        else if(selectionCount > 0){
            topLevelCheckBox.checked = false;
            topLevelCheckBox.indeterminate = true;
        }
        else{
            topLevelCheckBox.checked = false;
            topLevelCheckBox.indeterminate = false;
        }
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
        const topPanel = ConflictUtils.topPanelElement;
        const bottomPanel = ConflictUtils.bottomPanelElement;
    
        let handler1 = (e:Event)=>{
            if(!ConflictUtils.hoverTopPanel)
                return;
            const ratio = UiUtils.getVerticalScrollRatio(topPanel);
            const top = UiUtils.getVerticalScrollTop(bottomPanel, ratio);
            bottomPanel?.scrollTo({
                top
            });
        }

        let handler2 = (e:Event)=>{
            if(!ConflictUtils.hoverBottomPanel)
                return;
            const ratio = UiUtils.getVerticalScrollRatio(bottomPanel);
            const top = UiUtils.getVerticalScrollTop(topPanel, ratio);
            topPanel?.scrollTo({                    
                top,
            });
        }

        if(topPanel && bottomPanel){
            topPanel.addEventListener("scroll",handler1)
            bottomPanel.addEventListener("scroll",handler2);
        }
    }

    private static SetHeighlightedLines(){
        ConflictUtils.heighlightedLineIndexes = [];
        let lastItemHightlighted = false;        
        const lenght = ConflictUtils.currentLines?.length || ConflictUtils.incomingLines?.length || 0;
        for(let i = 0;i < lenght; i++){
            if(ConflictUtils.currentLines?.[i].hightLightBackground || ConflictUtils.incomingLines?.[i].hightLightBackground){
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
        if(!step)
            return;
        const container = document.querySelector("#"+ConflictUtils.topPanelId);
        if(!ConflictUtils.heighlightedLineIndexes.length)
            return;
        const focusElem = container?.querySelector('.line_numbers')?.children[ConflictUtils.heighlightedLineIndexes[step-1]];
        focusElem?.scrollIntoView({block:"center"});
        ConflictUtils.setBottomPanelScrollPosition();

    }

    private static setBottomPanelScrollPosition(){
        const conflictTop = ConflictUtils.topPanelElement;
        const conflictBottom = ConflictUtils.bottomPanelElement;
        const topScrollRatio = UiUtils.getVerticalScrollRatio(conflictTop);
        const top = UiUtils.getVerticalScrollTop(conflictBottom,topScrollRatio);
        conflictBottom.scrollTo({top});
    }
}