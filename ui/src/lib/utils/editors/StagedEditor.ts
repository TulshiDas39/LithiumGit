import { EditorState, Plugin, Transaction } from "prosemirror-state";
import {DecorationSet, Decoration} from "prosemirror-view"
import {Node} from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { ILine } from "../../interfaces";
import { IChange, IFile, StringUtils } from "common_library";
import { IpcUtils } from "../IpcUtils";
import { RepoUtils } from "../RepoUtils";
import { ReduxUtils } from "../ReduxUtils";
import { ActionUI } from "../../../store/slices/UiSlice";
import { ActionChanges } from "../../../store";
import { Data } from "../../data";
import { DiffUtils } from "../DiffUtils";
import { ChangeUtils } from "../ChangeUtils";
import { DataUtils } from "../DataUtils";
import { GitUtils } from "../GitUtils";

enum TransMetaData{
    DecorationChanged="DecorationChanged",
}

export class StagedEditor extends TextEditor{
    private _ilines:ILine[] = [];
    private _prevIlines:ILine[] = [];
    private _file:IFile = null!;
    private _tempStagedFilePath = '';
    private _tempHeadFilePath = '';
    private _changeUitl: ChangeUtils = null!;
    private _indexLastUpdated = '';
    constructor(containerSelector:string,changeUtil: ChangeUtils){
        super(containerSelector);
        this._changeUitl = changeUtil;
        this.onSync = () => this.updateDiff();
    }

    //the staged view is not directly editable, the index is only mutated through the unstage-hunk action
    protected override isEditable(){
        return false;
    }

    protected override getPlugins(){
        return [this.getHighlightPlugin(), ...super.getPlugins()];
    }

    protected override renderLineNumbers(){
        const lineElems:string[] = [];
        let lineNo = 1;
        let isChange = false;
        for(let i =0;i < this._ilines.length;i++){
            const line = this._ilines[i];
            let text = "<br/>";

            if(line.text !== undefined){
                text = lineNo+"";
                lineNo++;
            }
            let actionUi = '';
            if((line.text === undefined || line.hightLightBackground)){
                if(!isChange){
                    if(line.text === undefined){
                        text = '';
                    }
                    actionUi = `<span class="flex-grow-1 hunk-actions d-flex justify-content-end" data-iline="${i}">
                        <span class="bg-previous-change-deep px-1 hover unstage-hunk" title="unstage this change">-</span>
                    </span>`;
                }
                isChange = true;
            }else{
                isChange = false;
            }

            lineElems.push(`<p class="d-flex"><span>${text}</span>${actionUi}</p>`);
        }
        const lineNumbers = this.getLineNumberContainer();
        if(!lineNumbers) return;
        lineNumbers.style.width = `${String(this.lineCount).length + 3}ch`;
        lineNumbers.innerHTML = lineElems.join("");
        document.querySelectorAll<HTMLElement>(".unstage-hunk").forEach((elem:HTMLElement)=>{
            elem.addEventListener("click",(e)=>{
                const ilineIndex = Number(elem.parentElement?.getAttribute('data-iline'));
                this.unstageHunk(ilineIndex);
            })
        })
    }

    private computeHunkRevertChange(ilineIndex:number){
        const preHunk:ILine[] = [];
        const currentHunk:ILine[] = [];
        for(let i = ilineIndex;i<this._ilines.length;i++){
            let line = this._ilines[i];
            if(line.text !== undefined && !line.hightLightBackground)
                break;
            currentHunk.push(line);
            preHunk.push(this._prevIlines[i]);
        }

        const currentHunkTexts = currentHunk.filter(l => l.text !== undefined);
        const preHunkTexts = preHunk.filter(l => l.text !== undefined);
        const text = preHunkTexts.map(x=> x.text).join(this._lineFeedType);
        const change = {
            text:text,
        } as IChange;

        const curTrLineCount = this._ilines.slice(0,ilineIndex).filter(l => l.text === undefined).length;

        if(ilineIndex - curTrLineCount > 0){
            change.startlineIndex = ilineIndex - curTrLineCount - 1;
            change.startOffset = Number.MAX_SAFE_INTEGER;
        }else{
            change.startlineIndex = ilineIndex - curTrLineCount;
            change.startOffset = 0;
        }

        change.endlineIndex = change.startlineIndex + currentHunkTexts.length;
        change.endOffset = change.startOffset;

        if(preHunkTexts.length){
            if(change.startOffset > 0){
                change.text = this._lineFeedType + change.text;
            }else{
                change.text += this._lineFeedType;
            }
        }

        return change;
    }

    private async pushToIndex(filePath:string){
        const r2 = await IpcUtils.getRaw(["hash-object","-w", filePath]);
        if(r2.error)
            return false;

        const hash = r2.result?.trim()!;

        const r3 = await IpcUtils.getRaw(["update-index","--add","--cacheinfo","100644",hash, this._file.path]);
        return !r3.error;
    }

    private async unstageHunk(ilineIndex:number){
        const change = this.computeHunkRevertChange(ilineIndex);

        const r = await IpcUtils.trackFileChanges(this._tempStagedFilePath,[change],this._encoding);
        if(r.error)
            return;
        if(!await this.pushToIndex(this._tempStagedFilePath))
            return;

        await this.reRender(true);
        await this.updateDiff();

        GitUtils.getStatus();
    }

    private async updateDiff(){
        const uiLines = await DiffUtils.getDiffOfFiles(this._tempHeadFilePath, this._tempFilePath, this.getContentLines());
        this._ilines = uiLines.currentLines;
        this._prevIlines = uiLines.previousLines;
        this._changeUitl.updatePreviousChanges(this._prevIlines.slice());
        ReduxUtils.dispatch(ActionChanges.updateData({totalStep:this._changeUitl.totalChangeCount,silentStepUpdate:true}));
        this.renderLineNumbers();
        const tr = this._editView.state.tr;
        tr.setMeta(TransMetaData.DecorationChanged,true);
        this._editView.dispatch(tr);

    }


    protected override async readFile(){
        const succeeded = await super.readFile();
        if(!succeeded) return false;
        let lineConfigs = await DiffUtils.getDiffOfFiles(this._tempHeadFilePath, this._tempFilePath, this._lines);
        this._ilines = lineConfigs.currentLines;
        this._prevIlines = lineConfigs.previousLines;
        return true;
    }

    async renderILines(file:IFile){
        this._file = file;
        await this.copyStagedContent();
        await this.copyHeadContent();
        this._changeUitl.currentLines = [];
        this._changeUitl.previousLines = [];
        this._changeUitl.showChanges();
        const r = await this.render(this._tempStagedFilePath);
        this._changeUitl.updatePreviousChanges(this._prevIlines);
        return r;
    }

    private async copyStagedContent(){
        const fileExtension = StringUtils.GetFileExtension(this._file.path);
        const tempStagedFileName = `temp_index_${fileExtension}`;
        this._tempStagedFilePath = IpcUtils.joinPath(Data.appData.tempPath, tempStagedFileName);
        const r = await IpcUtils.copyStagedContent(this._file.path, this._tempStagedFilePath);
        this._indexLastUpdated = new Date().toISOString();
        return r;
    }

    private async copyHeadContent(){
        const fileExtension = StringUtils.GetFileExtension(this._file.path);
        const tempHeadFileName = `temp_head_${fileExtension}`;
        this._tempHeadFilePath = IpcUtils.joinPath(Data.appData.tempPath, tempHeadFileName);
        const r = await IpcUtils.copyHeadContent(this._file.path, this._tempHeadFilePath);
        return r;
    }

    private readonly buildDecorations = (doc: Node) => {
            const decorations: Decoration[] = [];
            let ilineIndex = 0;
            doc.forEach((node: Node, offset: number, index: number) => {
                let iline = this._ilines[ilineIndex];
                //TODO: null check not required after we make sure ilines are always in sync with lines, but for safety we can keep it for now
                if(!iline) return;
                while(!!iline && iline.text === undefined){
                    if(ilineIndex >= this._ilines.length) break;
                    decorations.push(Decoration.widget(offset, () => {
                        const spacer = document.createElement('div');
                        spacer.innerText = " ";
                        spacer.className = 'transparent-background noselect pm-spacer-widget';
                        return spacer;
                    }, { side: -1, key: `spacer-${ilineIndex}` }));
                    ilineIndex++;
                    iline = this._ilines[ilineIndex];
                }
                if(iline?.hightLightBackground){
                    decorations.push(Decoration.node(offset, offset + node.nodeSize, { class: 'bg-current-change' }));
                    for(let i=0; i<iline.textHightlightIndex.length; i++){
                        const range = iline.textHightlightIndex[i];
                        const start = offset + 1 + range.fromIndex;
                        const end = start + range.count;
                        decorations.push(Decoration.inline(start, end, { class: 'bg-current-change-deep' }));
                    }
                }
                ilineIndex++;

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

    override async checkForFileUpdate(){
        const indexFilePath = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path,".git/index");
        const lastUpdated = await IpcUtils.getLastUpdatedDate(indexFilePath);
        if(lastUpdated > this._indexLastUpdated){
            await this.copyStagedContent();
            await this.reRender(true);
            await this.updateDiff();
        }
        await super.checkForFileUpdate();
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
        this._changeUitl.ClearView();
    }
}
