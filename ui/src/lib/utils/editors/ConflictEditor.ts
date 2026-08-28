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
import { EnumHtmlIds } from "../../enums";

enum TransMetaData{
    DecorationChanged="DecorationChanged",
}

type TConflictSide = "current" | "incoming";

export class ConflictEditor extends TextEditor{
    static readonly currentMarker = "<<<<<<<";
    static readonly separator = "=======";
    static readonly endingMarker = ">>>>>>>";
    
    private readonly panelSelection:string = "";
    private _file:IFile = null!;
    private _scrollHandler?:(e:Event)=>void;
    private _conflictUtils: ConflictUtils;

    constructor(panelSelector:string){
        super(`${panelSelector} #${EnumHtmlIds.ConflictEditorBottomPanel} .content`);
        this.panelSelection = panelSelector;
        this._conflictUtils = new ConflictUtils(panelSelector);
        this._conflictUtils.dispatchResolvedCount = count => {
            ReduxUtils.dispatch(ActionConflict.updateData({resolvedConflict:count}));
        };
        this.saveHandler = success => this.onSave(success);
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
        this._conflictUtils.updateTopDiffView(this._conflictUtils.incomingLines, this._conflictUtils.currentLines);
        // this.handleScrolling();
        // this.buildTopPanel();
        return true;
    }

    // async renderILines(file:IFile){
    //     this._file = file;        
    //     const filePath = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path,this._file.path);
    //     await this.copyStagedContent();
    //     this._changeUitl.currentLines = [];
    //     this._changeUitl.previousLines = [];
    //     this._changeUitl.showChanges();
    //     const r = await this.render(filePath);
    //     this._changeUitl.updatePreviousChanges(this._prevIlines);
    //     this.handleDiscardHunk();
    //     return r;
    // }

    protected override async readFile(){
        const succeeded = await super.readFile();
        if(!succeeded) return false;
        const lineConfig = this._conflictUtils.GetUiLinesOfConflict(this._lines);
        this._conflictUtils.currentLines = lineConfig.currentLines;
        this._conflictUtils.incomingLines = lineConfig.previousLines;
        return true;
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
        if(text.startsWith(ConflictEditor.currentMarker)) return "startMarker" as const;
        if(text.startsWith(ConflictEditor.separator)) return "separator" as const;
        if(text.startsWith(ConflictEditor.endingMarker)) return "endMarker" as const;
        return undefined;
    }

    private readonly buildDecorations = (doc: Node) => {
        const decorations: Decoration[] = [];
        let side:TConflictSide | undefined;
        doc.forEach((node: Node, offset: number) => {
            const marker = ConflictEditor.sideOfLine(node.textContent ?? '');
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
