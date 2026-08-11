import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { DecorationSet, Decoration } from "prosemirror-view"
import { Node } from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { IFile } from "common_library";
import { IpcUtils } from "../IpcUtils";
import { RepoUtils } from "../RepoUtils";
import { ReduxUtils } from "../ReduxUtils";
import { ActionUI } from "../../../store/slices/UiSlice";
import { ActionModals } from "../../../store";
import { ModalData } from "../../../components/modals/ModalData";
import { DataUtils } from "../DataUtils";
import { GitUtils } from "../GitUtils";

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

    constructor(panelSelector:string){
        super(`${panelSelector} .content`);
        this._panelSelector = panelSelector;
        this.saveHandler = success => this.onSave(success);
    }

    //the conflicted file is edited in place, so the working tree copy is the source
    async renderFile(file:IFile){
        this._file = file;
        this.mountHost();
        const filePath = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path, file.path);
        return await this.render(filePath);
    }

    private get panelElement(){
        return document.querySelector(this._panelSelector) as HTMLElement | null;
    }

    private mountHost(){
        const panel = this.panelElement;
        if(!panel) return;
        panel.innerHTML = `<div class="h-100 w-100 d-flex conflict-resolution">
            <div class="noselect line_numbers overflow-y-hidden h-100"></div>
            <div class="h-100 content-container overflow-auto flex-grow-1">
                <div class="ps-1 content fit-content min-w-100"></div>
            </div>
        </div>`;
        this.handleScrolling();
    }

    private handleScrolling(){
        const contentContainer = this.panelElement?.querySelector(".content-container") as HTMLElement | null;
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
        return this.panelElement?.querySelector(".line_numbers") as HTMLElement | null;
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
        const contentContainer = this.panelElement?.querySelector(".content-container") as HTMLElement | null;
        if(contentContainer && this._scrollHandler)
            contentContainer.removeEventListener("scroll", this._scrollHandler);
        this._scrollHandler = undefined;
        super.destroy();
        const panel = this.panelElement;
        if(panel) panel.innerHTML = "";
    }
}
