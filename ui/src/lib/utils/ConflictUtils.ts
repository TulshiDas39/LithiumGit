import { EnumConflictSide, IActionTaken, IFile } from "common_library";
import { ILine } from "../interfaces";
import { EnumHtmlIds } from "../enums";
import ReactDOMServer from "react-dom/server";
import { ConflictTopPanel } from "../../components/selectedRepository/selectedRepoRight/changes/ConflictTopPanel";
import { ConflictBottomPanel } from "../../components/selectedRepository/selectedRepoRight/changes/ConflictBottomPanel";
import { UiUtils } from "./UiUtils";
import { DiffUtils } from "./DiffUtils";
import { NumUtils } from "./NumUtils";
import { ConflictView } from "../../components/selectedRepository/selectedRepoRight/changes/ConflictView";

export class ConflictUtils{
    readonly topPanelId = EnumHtmlIds.ConflictEditorTopPanel;
    readonly bottomPanelId = EnumHtmlIds.ConflictEditorBottomPanel;
    file?:IFile;
    currentLines:ILine[] = null!;
    incomingLines:ILine[] = null!;
    private heighlightedLineIndexes:number[]=[];
    private startingMarkers:{conflictNo:number;text:string}[] = [];
    private endingMarkers:{conflictNo:number;text:string}[] = [];
    private currentLineDivWidth = 0;
    private previousLineDivWidth = 0;
    private actionsTaken:IActionTaken[] = [];
    private currentEditorWidth = 0;
    private incomingEditorWidth = 0;
    private topPanel?:HTMLDivElement;
    private bottomPanel?:HTMLDivElement;
    private containerSelector = "";
    private scrollHandler?: (e: Event) => void;
    
    constructor(containerId:string){
        this.containerSelector = containerId;
    }

    get Actions(){
        return this.actionsTaken;
    }

    get TotalConflict(){
        const conflictNos = this.currentLines.filter(_=> !!_.conflictNo).map(_=>_.conflictNo!);
        return NumUtils.max(conflictNos);
    }
    get Separator(){
        return "=======";
    }

    get CurrentEditorWidth(){
        return this.currentEditorWidth;
    }

    get IncomingEditorWidth(){
        return this.incomingEditorWidth;
    }

    GetEndingMarkerText(conflictNo:number){
        return this.endingMarkers.find(_ => _.conflictNo === conflictNo);
    }

    private setEditorWidths(){
        this.currentEditorWidth = DiffUtils.getEditorWidth(this.currentLines.map(x=>x.text?x.text:""));
        this.incomingEditorWidth = DiffUtils.getEditorWidth(this.incomingLines.map(x=>x.text?x.text:""));
    }

    GetUiLinesOfConflict(contentLines: string[]) {
        const currentMarker = "<<<<<<<";
        const endingMarker = ">>>>>>>";

        //the markers are re-collected on every read, so drop the ones of the previous read
        this.startingMarkers = [];
        this.endingMarkers = [];

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
                this.startingMarkers.push({conflictNo,text:contentLine});
                continue;
            }
            if(contentLine === this.Separator){
                currentChangeDetected = false;
                incomingChangeDetected = true;
                continue;
            }
            if(contentLine.startsWith(endingMarker)){
                currentChangeDetected = false;
                incomingChangeDetected = false;
                this.endingMarkers.push({conflictNo,text:contentLine});
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

    private initialiseData(){
        this.setEditorWidths();
        this.topPanel = document.querySelector<HTMLDivElement>(`#${this.topPanelId}`)!;
        this.bottomPanel = document.querySelector<HTMLDivElement>(`#${this.bottomPanelId}`)!;
        this.acceptAllCurrentCheckBox.checked = false;
        this.acceptAllIncomingCheckBox.checked = false;
    }
    

    private getConflictNo(id:string){
        const value = UiUtils.resolveValueFromId(id);
        return value;
    }

    ShowEditor(file?:IFile){
        this.file = file;
        const container = document.querySelector(`${this.containerSelector}`)!;
        if(!container)
            return;
        const innerHtml = ReactDOMServer.renderToStaticMarkup(ConflictView({
            incomingLines:this.incomingLines,
            currentLines:this.currentLines
        }));
        container.innerHTML = innerHtml;
    }

    // showChanges(){
    //     const container = document.getElementById(`${this.containerId}`)!;
    //     if(!container)
    //         return;
    //     const innerHtml = ReactDOMServer.renderToStaticMarkup(Difference({
    //         linesAfterChange:this.currentLines,
    //         linesBeforeChange:this.previousLines
    //     }));
    //     container.innerHTML = innerHtml;
    //     this.HandleScrolling();
    //     this.SetHeighlightedLines();        
    // }

    updateTopDiffView(incomingLines:ILine[], currentLines:ILine[]){
        this.incomingLines = incomingLines;
        this.currentLines = currentLines;
        const container = document.querySelector(`${this.containerSelector} .top-diff`);
        const innerHtml = ReactDOMServer.renderToStaticMarkup(ConflictTopPanel({            
            currentLines:this.currentLines,
            previousLines:this.incomingLines
        }));

        container!.innerHTML = innerHtml;

        this.HandleScrolling();
    }

    // updatePreviousChanges(lines:ILine[]){
    //         this.previousLines = lines;
    //         const container = document.querySelector(`#${this.containerId} .difference .previous`);
    //         const innerHtml = ReactDOMServer.renderToStaticMarkup(DiffView({changeType:"previous",lines:this.previousLines}));
    //         container!.innerHTML = innerHtml;
    //         this.HandleScrolling();
    //         this.previousScrollableContainer?.scrollTo({
    //             top:this.currentScrollableContainer?.scrollTop,
    //             left:this.currentScrollableContainer?.scrollLeft,
    //         });
    //         this.SetHeighlightedLines();
    //     }
    

    private get topPanelElement(){
        const conflictTop = document.querySelector(".conflict-diff") as HTMLDivElement;
        return conflictTop;
    }

    private get bottomPanelElement(){
        const conflictBottom = document.querySelector(".conflict-bottom") as HTMLDivElement;
        return conflictBottom;
    }

    private get incomingCheckBoxes(){
        const checkboxes = document.querySelectorAll<HTMLInputElement>(".conflict-diff .previous input");
        return checkboxes;
    }

    private get currentCheckBoxes(){
        const checkboxes = document.querySelectorAll<HTMLInputElement>(".conflict-diff .current input");
        return checkboxes;
    }

    private get acceptAllIncomingCheckBox(){
        return document.querySelector(`#${EnumHtmlIds.accept_all_incoming}`) as HTMLInputElement;
    }

    private get acceptAllCurrentCheckBox(){
        return document.querySelector(`#${EnumHtmlIds.accept_all_current}`) as HTMLInputElement;
    }

    private get acceptIncomingElems(){
        return document.querySelectorAll<HTMLSpanElement>(`.accept_incoming`);
    }

    private get acceptCurrentElems(){
        return document.querySelectorAll<HTMLSpanElement>(`.accept_current`);
    }

    private get acceptBothElems(){
        return document.querySelectorAll<HTMLSpanElement>(`.accept_both`);
    }

    private addEventHanlders(){
        const acceptAllIncomingCheck = this.acceptAllIncomingCheckBox;
        acceptAllIncomingCheck.addEventListener("change",(e)=>{
            const checked = !!acceptAllIncomingCheck.checked;
            const checkboxes = this.incomingCheckBoxes;
            checkboxes.forEach(elem => {
                if(elem.checked !== checked){
                    elem.checked = checked;
                    const conflictNo  = Number(UiUtils.resolveValueFromId(elem.id));
                    this.updateConflictState(conflictNo);
                }
            });
        })

        const acceptAllCurrentCheck = this.acceptAllCurrentCheckBox;
        acceptAllCurrentCheck.addEventListener("change",(e)=>{
            const checked = !!acceptAllCurrentCheck.checked;
            const checkboxes = this.currentCheckBoxes;
            checkboxes.forEach(elem => {
                if(elem.checked !== checked){
                    elem.checked = checked;
                    const conflictNo  = Number(UiUtils.resolveValueFromId(elem.id));
                    this.updateConflictState(conflictNo);
                }
            });
        })

        const incomingCheckBoxes = this.incomingCheckBoxes;
        incomingCheckBoxes.forEach(elem=>{
            elem.addEventListener("change",(e)=>{
                this.updateTopLabelIncomingCheckboxState();
                const conflictNo = Number(UiUtils.resolveValueFromId(elem.id));
                this.updateConflictState(conflictNo);
            })
        })

        const currentCheckBoxes = this.currentCheckBoxes;
        currentCheckBoxes.forEach(elem=>{
            elem.addEventListener("change",(e)=>{
                this.updateTopLeveCurrentCheckboxState();
                const conflictNo = Number(UiUtils.resolveValueFromId(elem.id));
                this.updateConflictState(conflictNo);
            })
        })

        this.acceptIncomingElems.forEach(elem=>{
            elem.addEventListener("click",()=>{
                const conflictNo  = Number(UiUtils.resolveValueFromId(elem.id));
                this.handleAcceptIncoming(conflictNo);
            })
        })

        this.acceptCurrentElems.forEach(elem=>{
            elem.addEventListener("click",()=>{
                const conflictNo  = Number(UiUtils.resolveValueFromId(elem.id));
                this.handleAcceptCurrent(conflictNo);
            })
        })

        this.acceptBothElems.forEach(elem=>{
            elem.addEventListener("click",()=>{
                const conflictNo  = Number(UiUtils.resolveValueFromId(elem.id));
                this.handleAcceptCurrent(conflictNo);
                this.handleAcceptIncoming(conflictNo);
            })
        })

    }

    private handleAcceptIncoming(conflictNo:number){
        const checkBoxes = this.getCheckboxesByConflict(conflictNo);
        checkBoxes.incomingCheckBox.checked = true;
        this.updateTopLabelIncomingCheckboxState();
        this.updateConflictState(conflictNo);
    }

    private handleAcceptCurrent(conflictNo:number){
        const checkBoxes = this.getCheckboxesByConflict(conflictNo);
        checkBoxes.currentCheckBoxe.checked = true;
        this.updateTopLeveCurrentCheckboxState();
        this.updateConflictState(conflictNo);
    }

    private getIncomingCheckboxByConflict(conflictNo:number){
        return document.querySelector(`#${EnumConflictSide.Incoming}_${conflictNo}`) as HTMLInputElement;
    }

    private getCurrentCheckboxByConflict(conflictNo:number){
        return document.querySelector(`#${EnumConflictSide.Current}_${conflictNo}`) as HTMLInputElement;
    }

    private getCurrentLineElementsByConflict(conflictNo:number){
        return document.querySelectorAll<HTMLParagraphElement>(`.${EnumConflictSide.Current}_${conflictNo}`);
    }

    private getIncomingLineElementsByConflict(conflictNo:number){
        return document.querySelectorAll<HTMLParagraphElement>(`.${EnumConflictSide.Incoming}_${conflictNo}`);
    }

    private getCheckboxesByConflict(conflictNo:number){
        const incomingCheckBox = this.getIncomingCheckboxByConflict(conflictNo);
        const currentCheckBoxe = this.getCurrentCheckboxByConflict(conflictNo);
        return {incomingCheckBox,currentCheckBoxe};
    }

    private getContentLinesByConflict(conflictNo:number){
        const incomingLines = document.querySelectorAll(`.incoming.content.conflictNo_${conflictNo}`);
        const currentLines = document.querySelectorAll(`.current.content.conflictNo_${conflictNo}`);
        return {
            incomingLines,
            currentLines
        }
    }

    private updateTopPanelState(conflictNo:number){
        const checkboxes = this.getCheckboxesByConflict(conflictNo);
        const currentLineElements = this.getCurrentLineElementsByConflict(conflictNo);
        const incomingLineElements = this.getIncomingLineElementsByConflict(conflictNo);
        if(checkboxes.currentCheckBoxe.checked){
            currentLineElements.forEach(elem=> elem.classList.remove("bg-fade","bg-current-change","text-decoration-line-through"));
            currentLineElements.forEach(elem=> elem.classList.add("bg-change-accepted"));
        }
        else if(!checkboxes.currentCheckBoxe.checked){
            currentLineElements.forEach(elem=> elem.classList.add("bg-fade","text-decoration-line-through"));
            currentLineElements.forEach(elem=> elem.classList.remove("bg-current-change","bg-change-accepted"));
        }

        if(checkboxes.incomingCheckBox.checked){
            incomingLineElements.forEach(elem=> elem.classList.remove("bg-fade","bg-previous-change","text-decoration-line-through"));
            incomingLineElements.forEach(elem=> elem.classList.add("bg-change-accepted"));
        }
        else if(!checkboxes.incomingCheckBox.checked){
            incomingLineElements.forEach(elem=> elem.classList.add("bg-fade","text-decoration-line-through"));
            incomingLineElements.forEach(elem=> elem.classList.remove("bg-previous-change","bg-change-accepted"));
        }
    }

    private moveDownIncomingChange(conflictNo:number){
        const contentLines = this.getContentLinesByConflict(conflictNo);
        if(!contentLines.incomingLines.length)
            return;
        const firstItem = contentLines.incomingLines.item(0);
        contentLines.currentLines.forEach(elem=> firstItem.parentNode!.insertBefore(elem,firstItem));
        firstItem.classList.add("border-top");
    }

    private moveDownCurrentChange(conflictNo:number){
        const contentLines = this.getContentLinesByConflict(conflictNo);
        if(!contentLines.currentLines.length)
            return;
        const firstItem = contentLines.currentLines.item(0);
        contentLines.incomingLines.forEach(elem=> firstItem.parentNode!.insertBefore(elem,firstItem));
        firstItem.classList.add("border-top");
    }

    private updateBottomPanelState(conflictNo:number){
        let action = this.actionsTaken.find(_=> _.conflictNo === conflictNo);
        let newAction = false;
        if(!action){
            action = {
                conflictNo,
                taken:[]
            };
            this.actionsTaken.push(action);
            newAction = true;
        }

        const bottomPanel = this.bottomPanelElement;

        if(!bottomPanel){
            //ConflictResolutionEditor owns the bottom panel, so only the action bookkeeping applies here
            const selected = this.getCheckboxesByConflict(conflictNo);
            action.taken = [];
            if(selected.incomingCheckBox.checked)
                action.taken.push(EnumConflictSide.Incoming);
            if(selected.currentCheckBoxe.checked)
                action.taken.push(EnumConflictSide.Current);
            return;
        }

        const checkboxes = this.getCheckboxesByConflict(conflictNo);
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

        const contentLines = this.getContentLinesByConflict(conflictNo);
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
                this.moveDownCurrentChange(conflictNo);
            else
                this.moveDownIncomingChange(conflictNo);
        }
    }

    dispatchResolvedCount = (resolvedConflict:number)=>{}

    private updateConflictState(conflictNo:number){
        this.updateTopPanelState(conflictNo);
        this.updateBottomPanelState(conflictNo);
        this.dispatchResolvedCount(this.Actions.length);
        //ReduxUtils.dispatch(ActionConflict.updateData({}))
    }

    private updateTopLabelIncomingCheckboxState(){
        const topLevelCheckBox = this.acceptAllIncomingCheckBox;
        const checkboxes = this.incomingCheckBoxes;
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

    private updateTopLeveCurrentCheckboxState(){
        const topLevelCheckBox = this.acceptAllCurrentCheckBox;
        const checkboxes = this.currentCheckBoxes;
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

    private purgeEditorUi(){
        const elem = document.querySelector('.check_all_incoming') as HTMLElement;
        if(elem)
            elem.style.width = `${this.previousLineDivWidth}ch`;
        const elem2 = document.querySelector('.check_all_current') as HTMLElement;
        if(elem2)
            elem2.style.width = `${this.currentLineDivWidth}ch`;

    }

    get totalChangeCount(){
        return this.heighlightedLineIndexes.length;
    }

    private HandleScrolling(){
        const topPanel = this.topPanelElement;

        const bottomPanel = this.bottomPanelElement?.querySelector(".content-container") as HTMLElement;
        const bottomPanelLine = this.bottomPanelElement?.parentElement?.querySelector(".line_numbers") as HTMLElement;

        const topLeftPanel = topPanel.querySelector(".previous .content") as HTMLElement;
        const topLeftNumberPanel = topPanel.querySelector(".previous .line_numbers") as HTMLElement;
        const topRightPanel = topPanel.querySelector(".current .content") as HTMLElement;
        const topRightNumberPanel = topPanel.querySelector(".current .line_numbers") as HTMLElement;


        if(!topLeftPanel || !topRightPanel || !topLeftNumberPanel || !topRightNumberPanel)
            return;
        
        const group = [topLeftPanel, topRightPanel,topRightNumberPanel,topLeftNumberPanel];
        if(bottomPanel) group.push(bottomPanel);
        if(bottomPanelLine) group.push(bottomPanelLine);

        if(this.scrollHandler){
            topLeftPanel.removeEventListener("scroll", this.scrollHandler);
            topRightPanel.removeEventListener("scroll",this.scrollHandler);
            bottomPanel?.removeEventListener("scroll",this.scrollHandler);
        }
        

        this.scrollHandler = (e:Event)=>{
            const target = e.target as HTMLElement;
            const scrollElems = group.filter(elem => elem != target);
            for(let elem of scrollElems){
                elem.scrollTo({
                    top:target.scrollTop,
                    left:target.scrollLeft,
                })
            }
        }

        topLeftPanel.addEventListener("scroll",this.scrollHandler);
        topRightPanel.addEventListener("scroll",this.scrollHandler);
        bottomPanel?.addEventListener("scroll",this.scrollHandler);
    }

    private SetHeighlightedLines(){
        this.heighlightedLineIndexes = [];
        let lastItemHightlighted = false;
        const lenght = this.currentLines?.length || this.incomingLines?.length || 0;
        for(let i = 0;i < lenght; i++){
            if(this.currentLines?.[i].hightLightBackground || this.incomingLines?.[i].hightLightBackground){
                if(!lastItemHightlighted) {
                    this.heighlightedLineIndexes.push(i);
                    lastItemHightlighted = true;
                }
            }
            else
                lastItemHightlighted = false;
        }
    }

    FocusHightlightedLine(step:number){
        if(!step)
            return;
        const container = document.querySelector("#"+this.topPanelId);
        if(!this.heighlightedLineIndexes.length)
            return;
        const focusElem = container?.querySelector('.content')?.children[this.heighlightedLineIndexes[step-1]];
        focusElem?.scrollIntoView({block:"center"});

    }

    ClearView(){
        const topPanel = document.getElementById(`${this.topPanelId}`);
        if(topPanel)
            topPanel.innerHTML = "";
        this.file = undefined;
        this.heighlightedLineIndexes = [];
    }
}
