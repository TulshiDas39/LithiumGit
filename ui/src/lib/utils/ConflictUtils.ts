import { EnumConflictSide, IActionTaken, IFile } from "common_library";
import { ICEditorHiddenLine, IConflictEditorLine, IConflictLine, ILine } from "../interfaces";
import { EnumConflictMarker, EnumConflictState, EnumHtmlIds } from "../enums";
import ReactDOMServer from "react-dom/server";
import { ConflictTopPanel } from "../../components/selectedRepository/selectedRepoRight/changes/ConflictTopPanel";
import { UiUtils } from "./UiUtils";
import { DiffUtils } from "./DiffUtils";
import { NumUtils } from "./NumUtils";
import { ConflictView } from "../../components/selectedRepository/selectedRepoRight/changes/ConflictView";

export class ConflictUtils{
    readonly topPanelId = EnumHtmlIds.ConflictEditorTopPanel;
    readonly bottomPanelId = EnumHtmlIds.ConflictEditorBottomPanel;
    file?:IFile;
    currentLines:IConflictLine[] = null!;
    incomingLines:IConflictLine[] = null!;
    private heighlightedLineIndexes:number[]=[];
    private startingMarkers:{conflictNo:number;text:string}[] = [];
    private endingMarkers:{conflictNo:number;text:string}[] = [];
    private currentEditorWidth = 0;
    private incomingEditorWidth = 0;
    private topPanelContainer?:HTMLDivElement;
    private bottomPanelContainer?:HTMLDivElement;
    private containerSelector = "";
    private scrollHandler?: (e: Event) => void;
    private topLeftScrollContainer?: HTMLElement;
    private topRightScrollContainer?: HTMLElement;
    private bottomScrollContainer?: HTMLElement;
    private resizer?: HTMLElement;
    private hightDisplacement = 0;
    private onResizeDisplacement = 0;

    acceptChange:(conflictNo:number, side:EnumConflictSide,accept:boolean) => void = (_:number)=>{};
    acceptAllChanges:(side:EnumConflictSide, accept:boolean, conflictNos:number[]) => void = ()=>{};
    
    constructor(containerId:string){
        this.containerSelector = containerId;
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

        const currentLines:IConflictLine[] = [];
        const incomingLines:IConflictLine[] = [];
        let conflictNo = 0;
        let currentChangeDetected = false;
        let incomingChangeDetected = false;
        for(let i=0; i<contentLines.length; i++){
            const contentLine = contentLines[i];
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
                while(currentLines.length > incomingLines.length){
                    incomingLines.push({textHightlightIndex:[],conflictNo});
                }
                while(currentLines.length < incomingLines.length){
                    currentLines.push({textHightlightIndex:[],conflictNo});
                }
                continue;
            }
            if(currentChangeDetected){
                currentLines.push({
                    text:contentLine,
                    hightLightBackground:true,
                    textHightlightIndex:[],
                    conflictNo,
                });
                continue;
            }
            if(incomingChangeDetected){
                incomingLines.push({
                    text:contentLine,
                    hightLightBackground:true,
                    textHightlightIndex:[],
                    conflictNo,
                });
                continue;
            }
            incomingLines.push({
                text:contentLine,
                textHightlightIndex:[],
            })
            currentLines.push({
                text:contentLine,
                textHightlightIndex:[],
            })
        }
        return {currentLines, incomingLines};
    }

    GetUiLinesOfConflictFromDiff(prevLines: ILine[], currLines: ILine[]) {
        const currentMarker = "<<<<<<<";
        const endingMarker = ">>>>>>>";
        const dividerMarker = this.Separator;

        const currentLines:IConflictLine[] = [];
        const incomingLines:IConflictLine[] = [];
        const editorLines:IConflictEditorLine[] = [];
        const editorHiddenLines:ICEditorHiddenLine[] = [];
        let conflictNo = 0;


        const isResolved = (lines:ILine[])=>{
            const startingMarkerIndex = lines.findIndex(_=> _.text?.startsWith(currentMarker));
            if(startingMarkerIndex === -1){
                return true;
            }
            const separatorIndex = lines.findIndex(_=> _.text === dividerMarker);
            if(separatorIndex === -1){
                return true;
            }
            const endingMarkerIndex = lines.findIndex(_=> _.text?.startsWith(endingMarker));
            if(endingMarkerIndex === -1){
                return true;
            }
            if(startingMarkerIndex < separatorIndex && separatorIndex < endingMarkerIndex){
                return false;
            }
            
            return true;
        }      


        for(let i=0; i < currLines.length; i++){
            let curLine = currLines[i];
            let preLine = prevLines[i];            

            if(preLine.text?.startsWith(currentMarker)){
                conflictNo++;

                let inDiffLines:ILine[] = [];
                let inLines:IConflictLine[] = [];

                let cuDiffLines:ILine[] = [];
                let cuLines:IConflictLine[] = [];
                
                let eDiffLines:ILine[] = [];
                let eLines:IConflictEditorLine[] = [];
                const actionTaken:EnumConflictSide[] = [];

                let k = i + 1;

                while(k < prevLines.length && prevLines[k].text !== dividerMarker){
                    cuDiffLines.push(prevLines[k++]);
                }

                k++;
                
                while(k < prevLines.length && !prevLines[k].text?.startsWith(endingMarker)){
                    inDiffLines.push(prevLines[k++]);
                }

                k = Math.min(currLines.length - 1, k);

                for(let j = i; j <= k; j++){
                    eDiffLines.push(currLines[j]);
                }
                k++;

                while(k < prevLines.length && prevLines[k].text === undefined ){
                    eDiffLines.push(currLines[k]);
                    k++;
                }

                eDiffLines = eDiffLines.filter(_=> _.text !== undefined);
                inDiffLines = inDiffLines.filter(_=> _.text !== undefined);
                cuDiffLines = cuDiffLines.filter(_=> _.text !== undefined);


                for(let line of cuDiffLines){
                    cuLines.push({
                        text:line.text,
                        hightLightBackground:true,
                        textHightlightIndex:[],
                        conflictNo,
                    });
                }

                for(let line of inDiffLines){
                    inLines.push({
                        text:line.text,
                        hightLightBackground:true,
                        textHightlightIndex:[],
                        conflictNo,
                    });
                }


                const resolved = isResolved(eDiffLines);

                if(!resolved){

                    let rLine = eDiffLines.shift()!;
                    while(!rLine.text!.startsWith(currentMarker)){
                        eLines.push({
                            text:rLine.text,
                            hightLightBackground:true,
                            textHightlightIndex:[],
                            conflictNo,
                        });
                        rLine = eDiffLines.shift()!;
                    }

                    eLines.push({
                        text:rLine.text,
                        hightLightBackground:true,
                        textHightlightIndex:[],
                        conflictNo,
                        marker:EnumConflictMarker.Starting,
                    });

                    rLine = eDiffLines.shift()!;

                    while(rLine.text !== dividerMarker){
                        eLines.push({
                            text:rLine.text,
                            hightLightBackground:true,
                            textHightlightIndex:[],
                            conflictNo,
                            state:EnumConflictState.FromCurrent,
                        });
                        rLine = eDiffLines.shift()!;
                    }

                    eLines.push({
                        text:rLine.text,
                        hightLightBackground:true,
                        textHightlightIndex:[],
                        conflictNo,
                        marker:EnumConflictMarker.Divider,
                    });
                    
                    rLine = eDiffLines.shift()!;
                    
                    while(!rLine.text?.startsWith(endingMarker)){
                        eLines.push({
                            text:rLine.text,
                            hightLightBackground:true,
                            textHightlightIndex:[],
                            conflictNo,
                            state:EnumConflictState.FromIncoming,
                        });
                        rLine = eDiffLines.shift()!;
                    }

                    eLines.push({
                        text:rLine.text,
                        hightLightBackground:true,
                        textHightlightIndex:[],
                        conflictNo,
                        marker:EnumConflictMarker.Ending,
                    });

                    rLine = eDiffLines.shift()!;
                    while(rLine){
                        eLines.push({
                            text:rLine.text,
                            hightLightBackground:true,
                            textHightlightIndex:[],
                            conflictNo,
                        });
                        rLine = eDiffLines.shift()!;
                    }
                }
                else{                    
                    const insertRLines = (count:number, state:EnumConflictState)=>{
                        for(let j=0; j < count; j++){
                            eLines.push({
                                text:eDiffLines[j].text,
                                hightLightBackground:true,
                                textHightlightIndex:[],
                                conflictNo,
                                state,
                            });
                        }
                    }

                    if(cuDiffLines.length <= eDiffLines.length && cuDiffLines.every((_,li)=> _.text === eDiffLines[li].text)){
                        let remrLines = eDiffLines.slice(cuDiffLines.length);
                        if(remrLines.length){
                            if(remrLines.length === inDiffLines.length && inDiffLines.every((_,li)=> _.text === remrLines[li].text)){
                                insertRLines(cuDiffLines.length, EnumConflictState.FromCurrent);
                                eDiffLines = remrLines;
                                insertRLines(inDiffLines.length, EnumConflictState.FromIncoming);
                                actionTaken.push(EnumConflictSide.Current,EnumConflictSide.Incoming);                                
                            }
                            else{
                                insertRLines(eDiffLines.length, EnumConflictState.Custom);                                
                            }
                        }
                        else{
                            insertRLines(eDiffLines.length, EnumConflictState.FromCurrent);
                            actionTaken.push(EnumConflictSide.Current); 
                        }
                    }
                    else if(inDiffLines.length <= eDiffLines.length && inDiffLines.every((_,li)=> _.text === eDiffLines[li].text)){
                        let remrLines = eDiffLines.slice(inDiffLines.length);
                        if(remrLines.length){
                            if(remrLines.length === cuDiffLines.length && cuDiffLines.every((_,li)=> _.text === remrLines[li].text)){
                                insertRLines(inDiffLines.length, EnumConflictState.FromIncoming);
                                eDiffLines = remrLines;
                                insertRLines(cuDiffLines.length, EnumConflictState.FromCurrent);
                                actionTaken.push(EnumConflictSide.Incoming, EnumConflictSide.Current);
                            }
                            else{
                                insertRLines(eDiffLines.length, EnumConflictState.Custom);
                            }
                        }else{
                            insertRLines(eDiffLines.length, EnumConflictState.FromIncoming);
                            actionTaken.push(EnumConflictSide.Incoming); 
                        }
                    }
                    else{
                        insertRLines(eDiffLines.length, EnumConflictState.Custom);
                    }
                                        
                }

                while(inLines.length < cuLines.length){
                    inLines.push({
                        textHightlightIndex:[],
                        conflictNo,
                    });
                }

                while(cuLines.length < inLines.length){
                    cuLines.push({
                        textHightlightIndex:[],
                        conflictNo,
                    });
                }

                if(resolved){
                    const curTaken = actionTaken.includes(EnumConflictSide.Current);

                    for(let line of cuLines){
                        line.taken = curTaken;
                    }

                    const inTaken = actionTaken.includes(EnumConflictSide.Incoming);

                    for(let line of inLines){
                        line.taken = inTaken;
                    }
                }

                inLines.forEach(_=> incomingLines.push(_));
                cuLines.forEach(_=> currentLines.push(_));
                eLines.forEach(_=> editorLines.push(_));

                if(!eLines.length){
                    editorHiddenLines.push({                        
                        conflictNo,
                        afterLineIndex:editorLines.length-1,
                    });
                }

                i = k - 1;
                
                continue;
            }

            if(curLine.text === undefined){
                continue;
            }
            
            currentLines.push({
                text:curLine.text,
                textHightlightIndex:[],
            });
            incomingLines.push({
                text:curLine.text,
                textHightlightIndex:[],
            });

            editorLines.push({
                text:curLine.text,
                textHightlightIndex:[],
            });

        }

        return {currentLines, incomingLines, editorLines, editorHiddenLines};
    }

    private initialiseData(){
        this.setEditorWidths();
        this.topPanelContainer = document.querySelector<HTMLDivElement>(`#${this.topPanelId}`)!;
        this.bottomPanelContainer = document.querySelector<HTMLDivElement>(`#${this.bottomPanelId}`)!;
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
        this.resolveElements();
        this.addEventHanlders();
        this.HandleScrolling();
        this.handleDragging();
    }

    private resolveElements(){
        this.resizer = document.querySelector(`${this.containerSelector} .resizer`) as HTMLElement;
        this.bottomPanelContainer = document.querySelector<HTMLDivElement>(`${this.containerSelector} #${EnumHtmlIds.ConflictEditorBottomPanel}`)!;        
        this.topPanelContainer = document.querySelector<HTMLDivElement>(`${this.containerSelector} .top-diff`)!;
    }

    private handleDragging(){
        if(!this.resizer)
            return;
        let initialMousePositionY:number = null!;

        const moveListener =(e:MouseEvent)=>{            
            this.onResizeDisplacement = e.clientY-initialMousePositionY;
            this.updateResizerPosition();
        }

        const selectListener = (e:Event) => {
            e.preventDefault();
            return false
        };

        const downListener = (e:MouseEvent)=>{
            this.onResizeDisplacement = 0;
            initialMousePositionY = e.clientY;
            document.addEventListener("mousemove",moveListener);
            document.addEventListener("mouseup",upListener);
            document.addEventListener("selectstart",selectListener);
         }

        const upListener = ()=>{
            document.removeEventListener("mousemove",moveListener);
            document.removeEventListener("mouseup",upListener);
            document.removeEventListener("selectstart",selectListener);
            this.hightDisplacement -= this.onResizeDisplacement;
            this.onResizeDisplacement = 0;
        }
        
        this.resizer.addEventListener("mousedown",downListener);
    }
    
    private updateResizerPosition(){
        const getSign=(value:number)=>{
            if(value < 0)
                return "-";
            return "+";
        }
        const displacement = this.hightDisplacement - this.onResizeDisplacement;
        this.topPanelContainer!.style.height = `calc(50% ${getSign(-(displacement+3))}  ${Math.abs(displacement+3)}px)`;
        this.bottomPanelContainer!.style.height = `calc(50% ${getSign(displacement)} ${Math.abs(displacement)}px)`;
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

    updateTopDiffView(incomingLines:IConflictLine[], currentLines:IConflictLine[]){
        this.incomingLines = incomingLines;
        this.currentLines = currentLines;
        const container = document.querySelector(`${this.containerSelector} .top-diff`);
        const innerHtml = ReactDOMServer.renderToStaticMarkup(ConflictTopPanel({            
            currentLines:this.currentLines,
            previousLines:this.incomingLines
        }));

        container!.innerHTML = innerHtml;

        this.HandleScrolling();
        this.addTopPanelEventHandlers();

        this.topLeftScrollContainer?.scrollTo({
            top:this.bottomScrollContainer?.scrollTop,
            left:this.bottomScrollContainer?.scrollLeft,
        });

        this.updateTopLabelCheckboxState();

        this.SetHeighlightedLines();
    }

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

    private checkBoxesOfSide(side:EnumConflictSide){
        return side === EnumConflictSide.Incoming ? this.incomingCheckBoxes : this.currentCheckBoxes;
    }

    private topCheckBoxOfSide(side:EnumConflictSide){
        return side === EnumConflictSide.Incoming ? this.acceptAllIncomingCheckBox : this.acceptAllCurrentCheckBox;
    }

    linesOfSide(side:EnumConflictSide){
        return side === EnumConflictSide.Incoming ? this.incomingLines : this.currentLines;
    }

    get conflictCount(){
        return (new Set(this.incomingLines.filter(x => !!x.conflictNo).map(x => x.conflictNo!))).size;
    }

    get resolvedCount(){
        return (new Set(this.incomingLines.filter(x => !!x.conflictNo && x.taken !== undefined).map(x => x.conflictNo!))).size;
    }

    private addTopPanelEventHandlers(){
        for(const side of [EnumConflictSide.Incoming, EnumConflictSide.Current]){
            const topCheckBox = this.topCheckBoxOfSide(side);
            topCheckBox?.addEventListener("change",()=>{
                const checked = !!topCheckBox.checked;
                const changedConflictNos:number[] = [];
                const lines = this.linesOfSide(side).filter(x => !!x.conflictNo);
                const conflictCount = this.conflictCount;
                for(let i = 1; i <= conflictCount;i++){
                    const accepted = lines.filter(x => x.conflictNo === i).some(x => x.taken);
                    if(accepted !== checked){
                        changedConflictNos.push(i);
                    }
                }                
                if(changedConflictNos.length)
                    this.acceptAllChanges(side, checked, changedConflictNos);
            });

            this.checkBoxesOfSide(side).forEach(elem=>{
                elem.addEventListener("change",()=>{
                    const conflictNo = Number(UiUtils.resolveValueFromId(elem.id));
                    this.acceptChange(conflictNo, side, !!elem.checked);
                })
            })
        }
    }

    private addEventHanlders(){
        this.addTopPanelEventHandlers();
    }


    private updateTopLabelCheckboxState(){
        const incomingCheckBox = this.acceptAllIncomingCheckBox;
        
        if(incomingCheckBox.checked)
            return;

        if(this.incomingLines.filter(x => !!x.conflictNo).some(x => !!x.taken))
            incomingCheckBox.indeterminate = true;

        const currentCheckbox = this.acceptAllCurrentCheckBox;
        if(currentCheckbox.checked)
            return;

        if(this.currentLines.filter(x => !!x.conflictNo).some(x => !!x.taken))
            currentCheckbox.indeterminate = true;
    }


    get totalChangeCount(){
        return this.heighlightedLineIndexes.length;
    }

    private HandleScrolling(){
        const topPanel = this.topPanelElement;

        const bottomPanel = this.bottomPanelElement?.querySelector(".content-container") as HTMLElement;
        this.bottomScrollContainer = bottomPanel;
        const bottomPanelLine = this.bottomPanelElement?.parentElement?.querySelector(".line_numbers") as HTMLElement;

        const topLeftPanel = topPanel.querySelector(".previous .content") as HTMLElement;
        this.topLeftScrollContainer = topLeftPanel;
        const topLeftNumberPanel = topPanel.querySelector(".previous .line_numbers") as HTMLElement;
        const topRightPanel = topPanel.querySelector(".current .content") as HTMLElement;
        this.topRightScrollContainer = topRightPanel;
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
