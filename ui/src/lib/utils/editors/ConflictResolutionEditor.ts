import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { DecorationSet, Decoration } from "prosemirror-view"
import { Node } from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { IFile } from "common_library";
import { IpcUtils } from "../IpcUtils";
import { RepoUtils } from "../RepoUtils";
import { ReduxUtils } from "../ReduxUtils";
import { ActionUI } from "../../../store/slices/UiSlice";
import { ActionChanges, ActionConflict, ActionModals } from "../../../store";
import { ModalData } from "../../../components/modals/ModalData";
import { DataUtils } from "../DataUtils";
import { GitUtils } from "../GitUtils";
import { ConflictUtils } from "../ConflictUtils";

enum TransMetaData{
    DecorationChanged="DecorationChanged",
}

type TConflictSide = "current" | "incoming";

export class ConflictResolutionEditor extends TextEditor{
    static readonly currentMarker = "<<<<<<<";
    static readonly separator = "=======";
    static readonly endingMarker = ">>>>>>>";

    private _panelSelector = '';
    private _file:IFile = null!;
    private _scrollHandler?:(e:Event)=>void;
    private _conflictUtils: ConflictUtils;

    constructor(panelSelector:string){
        super(`${panelSelector} .content`);
        this._panelSelector = panelSelector;
        this._conflictUtils = new ConflictUtils();
        this._conflictUtils.dispatchResolvedCount = count => {
            ReduxUtils.dispatch(ActionConflict.updateData({resolvedConflict:count}));
        };
        this.saveHandler = success => this.onSave(success);
    }

    //ConflictUtils is driven only from here, the navigator and the file list go through these
    focusHightlightedLine(step:number){
        this._conflictUtils.FocusHightlightedLine(step);
    }

    get actions(){
        return this._conflictUtils.Actions;
    }
    
    async renderFile(file:IFile){
        this._file = file;
        this._conflictUtils.file = file;                
        const filePath = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path, file.path);
        const success = await this.render(filePath);
        if(!success)
            return false;
        this.buildTopPanel();
        return true;
    }

    //the conflict lines feed the top panel, they are derived from the same content the editor displays
    protected override async readFile(){
        const succeeded = await super.readFile();
        if(!succeeded) return false;
        const lineConfig = this._conflictUtils.GetUiLinesOfConflict(this._lines);
        this._conflictUtils.currentLines = lineConfig.currentLines;
        this._conflictUtils.incomingLines = lineConfig.previousLines;
        return true;
    }

    private buildTopPanel(){        
        this._conflictUtils.ShowTopPanel();
        this._conflictUtils.FocusHightlightedLine(1);
        ReduxUtils.dispatch(ActionChanges.updateData({totalStep:this._conflictUtils.totalChangeCount,currentStep:1}));
        ReduxUtils.dispatch(ActionConflict.updateData({resolvedConflict:0,totalConflict:this._conflictUtils.TotalConflict}));
    }

    private get panelElement(){
        return document.querySelector(this._panelSelector) as HTMLElement | null;
    }

    private handleScrolling(){
        const contentContainer = document.querySelector(this._containerSelector)?.closest(".content-container") as HTMLElement | null;
        const lineNumbers = this.getLineNumberContainer();
        if(!contentContainer || !lineNumbers) return;
        if(this._scrollHandler)
            contentContainer.removeEventListener("scroll", this._scrollHandler);
        this._scrollHandler = () => {
            lineNumbers.scrollTo({ top: contentContainer.scrollTop });
        };
        contentContainer.addEventListener("scroll", this._scrollHandler);
    }

    protected override getLineNumberContainer(){
        const row = document.querySelector(this._containerSelector)?.closest(".conflict-bottom");
        return row?.querySelector(".line_numbers") as HTMLElement | null;
    }

    protected override getPlugins(){
        return [this.getHighlightPlugin(), ...super.getPlugins()];
    }

    private static sideOfLine(text:string){
        if(text.startsWith(ConflictResolutionEditor.currentMarker)) return "startMarker" as const;
        if(text.startsWith(ConflictResolutionEditor.separator)) return "separator" as const;
        if(text.startsWith(ConflictResolutionEditor.endingMarker)) return "endMarker" as const;
        return undefined;
    }

    private readonly buildDecorations = (doc: Node) => {
        const decorations: Decoration[] = [];
        let side:TConflictSide | undefined;
        doc.forEach((node: Node, offset: number) => {
            const marker = ConflictResolutionEditor.sideOfLine(node.textContent ?? '');
            const decorate = (className:string)=>{
                decorations.push(Decoration.node(offset, offset + node.nodeSize, { class: className }));
            };
            if(marker === "startMarker"){
                side = "current";
                decorate('bg-current-change-deep');
                return;
            }
            if(marker === "separator"){
                side = "incoming";
                decorate('bg-fade');
                return;
            }
            if(marker === "endMarker"){
                side = undefined;
                decorate('bg-previous-change-deep');
                return;
            }
            if(side === "current")
                decorate('bg-current-change');
            else if(side === "incoming")
                decorate('bg-previous-change');
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
            if(ConflictResolutionEditor.sideOfLine(node.textContent ?? '') === "startMarker")
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
        super.destroy();        
        this._conflictUtils.ClearView();
        const content = document.querySelector(this._panelSelector)?.querySelector(".content")!;
        content.innerHTML = '';
    }
}
