import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { DecorationSet, Decoration } from "prosemirror-view"
import { Node } from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { EnumConflictSide, IChange, IFile } from "common_library";
import { IpcUtils } from "../IpcUtils";
import { RepoUtils } from "../RepoUtils";
import { ReduxUtils } from "../ReduxUtils";
import { ActionUI } from "../../../store/slices/UiSlice";
import { ActionChanges, ActionConflict, ActionModals } from "../../../store";
import { ModalData } from "../../../components/modals/ModalData";
import { DataUtils } from "../DataUtils";
import { GitUtils } from "../GitUtils";
import { ConflictUtils } from "../ConflictUtils";
import { EnumConflictMarker, EnumConflictState, EnumHtmlIds } from "../../enums";
import { ICEditorHiddenLine, IConflictEditorLine, IConflictLine, IConflictPosition, ILine } from "../../interfaces";
import { DiffUtils } from "../DiffUtils";

enum TransMetaData{
    DecorationChanged="DecorationChanged",
}

export class ConflictEditor extends TextEditor{
    static readonly currentMarker = "<<<<<<<";
    static readonly separator = "=======";
    static readonly endingMarker = ">>>>>>>";
    
    private _file:IFile = null!;
    private _scrollHandler?:(e:Event)=>void;
    private _conflictUtils: ConflictUtils;
    private _incomingLines:IConflictLine[] = [];
    private _currentLines:IConflictLine[] = [];
    private _eLines:IConflictEditorLine[] = [];
    private _eHiddenLines:ICEditorHiddenLine[] = [];


    constructor(panelSelector:string){
        super(`${panelSelector} #${EnumHtmlIds.ConflictEditorBottomPanel} .content`);
        this._conflictUtils = new ConflictUtils(panelSelector);
        this.saveHandler = success => this.onSave(success);
        this._conflictUtils.acceptChange = (conflictNo, side, accept) => this.acceptChange(conflictNo, side, accept);
        this._conflictUtils.acceptAllChanges = (side, accept, conflictNos) => this.acceptAllChanges(side, accept, conflictNos);
        this.onSync = () => this.updateDiff();
    }
    
    focusHightlightedLine(step:number){
        this._conflictUtils.FocusHightlightedLine(step);
    }

    get actions(){
        return this._conflictUtils.Actions;
    }

    get totalChangeCount(){
        return this._conflictUtils.totalChangeCount;
    }    
    
    async renderFile(file:IFile){
        this._file = file;
        const filePath = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path, file.path);
        this._conflictUtils.currentLines = [];
        this._conflictUtils.incomingLines = [];
        this._conflictUtils.ShowEditor(file);
        const success = await this.render(filePath);
        if(!success)
            return false;
        this._conflictUtils.updateTopDiffView(this._incomingLines.slice(), this._currentLines.slice());
        // this.handleScrolling();
        // this.buildTopPanel();
        return true;
    }

    private buildAcceptChange(conflictNo:number, side:EnumConflictSide, accept:boolean){
        let startIndex = this._eLines.findIndex(x => x.conflictNo === conflictNo);
        let afterIndex:number | undefined;

        let eLines:IConflictEditorLine[] = [];
        if(startIndex < 0) {
            afterIndex = this._eHiddenLines.find(x => x.conflictNo === conflictNo)?.afterLineIndex;
            if(!afterIndex) {
                return undefined;
            }
            startIndex = afterIndex+1;
        }else{
            eLines = this._eLines.filter(x => x.conflictNo === conflictNo);
        }
        
        const sLines = (side === EnumConflictSide.Incoming ? this._incomingLines : this._currentLines).filter(x => x.conflictNo === conflictNo && x.text !== undefined);
        const state = side === EnumConflictSide.Incoming ? EnumConflictState.FromIncoming : EnumConflictState.FromCurrent;
        let newELines:IConflictEditorLine[]  = [];
        if(!eLines[0]?.marker){
            newELines = eLines.filter(x => x.state !== state && x.state !== EnumConflictState.Custom);
        }
        if(accept){
            newELines = newELines.concat(sLines.map(x => ({...x, state})));
        }
        const change = {} as IChange;
        
        
        change.startlineIndex = startIndex;
        change.startOffset = 0;
        
        change.endlineIndex = change.startlineIndex + eLines.length;
        change.endOffset = change.startOffset;
        change.text = newELines.map(x => x.text).join(this._lineFeedType);
        if(newELines.length){
            if(change.startOffset > 0){
                change.text = this._lineFeedType + change.text;
            }else{
                change.text += this._lineFeedType;
            }
        }

        return change;
    }

    private acceptChange(conflictNo:number, side:EnumConflictSide, accept:boolean){
        const change = this.buildAcceptChange(conflictNo, side, accept);
        if(change)
            this.applyChange(change);
    }
    
    private acceptAllChanges(side:EnumConflictSide, accept:boolean, conflictNos:number[]){
        const changes = conflictNos.map(conflictNo => this.buildAcceptChange(conflictNo, side, accept))
            .filter((change):change is IChange => !!change);
        this.applyChanges(changes);
    }

    protected override async readFile(){
        const succeeded = await super.readFile();
        if(!succeeded) return false;
        const lines:ILine[] = this._lines.map(text=> ({text, textHightlightIndex:[]}));
        const lineConfig = this._conflictUtils.GetUiLinesOfConflictFromDiff(lines, lines);
        this._incomingLines = lineConfig.incomingLines;
        this._currentLines = lineConfig.currentLines;
        this._eLines = lineConfig.editorLines;
        this._eHiddenLines = lineConfig.editorHiddenLines;
        return true;
    }

    private async updateDiff(){ 
        const options = ["-c", "core.autocrlf=false", "-c", "core.safecrlf=false", "diff","--diff-algorithm=minimal","--ignore-cr-at-eol","--no-index", this._sourceFilePath, this._tempFilePath];
        const r = await IpcUtils.getRaw(options);        
        const diffResult = r.result!;
        const contentLines = this.getContentLines();
        const uiLines = DiffUtils.GetUiLines(diffResult,contentLines);   
        const lineConfig = this._conflictUtils.GetUiLinesOfConflictFromDiff(uiLines.previousLines, uiLines.currentLines);
        this._incomingLines = lineConfig.incomingLines;
        this._currentLines = lineConfig.currentLines;
        this._eLines = lineConfig.editorLines;
        this._eHiddenLines = lineConfig.editorHiddenLines;
        this._conflictUtils.updateTopDiffView(this._incomingLines.slice(), this._currentLines.slice());
        ReduxUtils.dispatch(ActionChanges.updateData({totalStep:this.totalChangeCount,silentStepUpdate:true}));
        ReduxUtils.dispatch(ActionConflict.updateData({resolvedConflict:this._conflictUtils.resolvedCount,totalConflict:this._conflictUtils.conflictCount}));
        this.renderLineNumbers();
        const tr = this._editView.state.tr;
        tr.setMeta(TransMetaData.DecorationChanged,true);        
        this._editView.dispatch(tr);
    }

    protected override async save(){
        return true;
    }

    protected override getLineNumberContainer(){
        const row = document.querySelector(this._containerSelector)?.closest(".conflict-bottom");
        return row?.querySelector(".line_numbers") as HTMLElement | null;
    }

    protected override getPlugins(){
        return [this.getHighlightPlugin(), ...super.getPlugins()];
    }

    private static sideOfLine(text:string){
        if(text.startsWith(ConflictEditor.currentMarker)) return "startMarker" as const;
        if(text.startsWith(ConflictEditor.separator)) return "separator" as const;
        if(text.startsWith(ConflictEditor.endingMarker)) return "endMarker" as const;
        return undefined;
    }

    private static decorationClassOf(iLine:IConflictEditorLine){
        switch(iLine.marker){
            case EnumConflictMarker.Starting: return 'bg-current-change-deep';
            case EnumConflictMarker.Divider: return 'bg-fade';
            case EnumConflictMarker.Ending: return 'bg-previous-change-deep';
        }
        switch(iLine.state){
            case EnumConflictState.FromCurrent: return 'bg-current-change';
            case EnumConflictState.FromIncoming: return 'bg-previous-change';
            case EnumConflictState.Custom: return 'bg-custom-change';
        }
        return undefined;
    }

    private readonly buildDecorations = (doc: Node) => {
        const decorations: Decoration[] = [];
        let iLineIndex = 0;
        doc.forEach((node: Node, offset: number) => {
            const iLine = this._eLines[iLineIndex++];
            if(!iLine) return;
            const className = ConflictEditor.decorationClassOf(iLine);
            if(!className) return;
            decorations.push(Decoration.node(offset, offset + node.nodeSize, { class: className }));
        });
        return DecorationSet.create(doc, decorations);
    };

    private getHighlightPlugin(){
        return new Plugin({
            state: {
                init: (_: any, { doc }: {doc:Node}) => this.buildDecorations(doc),
                apply: (tr: Transaction, set: DecorationSet) => (tr.docChanged || !!tr.getMeta(TransMetaData.DecorationChanged)) ? this.buildDecorations(tr.doc) : set,
            },
            props: {
                decorations(state: EditorState) { return this.getState(state); },
            },
        });
    }

    //number of conflicts still carrying markers in the edited document
    get unresolvedConflictCount(){
        if(!this._editView) return 0;
        let count = 0;
        this._editView.state.doc.forEach(node => {
            if(ConflictEditor.sideOfLine(node.textContent ?? '') === "startMarker")
                count++;
        });
        return count;
    }

    get isFullyResolved(){
        return this.unresolvedConflictCount === 0;
    }

    get file(){
        return this._file;
    }

    saveChanges(){
        return this.save();
    }

    private onSave(success:boolean){
        ReduxUtils.dispatch(ActionUI.setSync(undefined));
        if(success){
            ModalData.appToast.message = "Saved successfully.";
            ReduxUtils.dispatch(ActionModals.showToast());
            GitUtils.getStatus();
        }else{
            ModalData.appToast.message = "Failed to save changes.";
            ReduxUtils.dispatch(ActionModals.showToast());
        }
    }

    protected displayLineFeedType(): void{
        ReduxUtils.dispatch(ActionUI.setLinefeedType(this._lineFeedType));
    }
    protected displayEncoding(): void{
        ReduxUtils.dispatch(ActionUI.setEncoding(this._encoding));
    }

    protected addLfTypeChangeHandler(callback: () => void): void {
        DataUtils.handleLFTypeChangeOfModifiedFile = callback;
    }
    protected addEncodingChangeHandler(callback: (encoding: string) => void): void {
        DataUtils.handleEncodingChangeOfModifiedFile = callback;
    }

    override destroy(){
        const contentContainer = document.querySelector(this._containerSelector)?.closest(".content-container") as HTMLElement | null;
        if(contentContainer && this._scrollHandler)
            contentContainer.removeEventListener("scroll", this._scrollHandler);
        this._scrollHandler = undefined;
        super.destroy();
        //ClearView drops the host markup of both panels, the mounted view goes with it
        this._conflictUtils.ClearView();
    }
}
