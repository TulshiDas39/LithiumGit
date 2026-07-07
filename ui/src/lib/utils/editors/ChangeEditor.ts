import { EditorState, Plugin, Transaction } from "prosemirror-state";
import {DecorationSet, Decoration} from "prosemirror-view"
import {Fragment, Node, Slice} from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { ILine } from "../../interfaces";
import { IChange, IFile, StringUtils } from "common_library";
import { IpcUtils } from "../IpcUtils";
import { RepoUtils } from "../RepoUtils";
import { ReduxUtils } from "../ReduxUtils";
import { ActionUI } from "../../../store/slices/UiSlice";
import { ActionChanges, ActionModals } from "../../../store";
import { ModalData } from "../../../components/modals/ModalData";
import { Data } from "../../data";
import { DiffUtils } from "../DiffUtils";
import { ChangeUtils } from "../ChangeUtils";
import { DataUtils } from "../DataUtils";
import { GitUtils } from "../GitUtils";
import { ArrayUtils } from "../ArrayUtils";
import { UiUtils } from "../UiUtils";
import { FaUndo } from "react-icons/fa";

enum TransMetaData{
    DecorationChanged="DecorationChanged",
}

export class ChangeEditor extends TextEditor{    
    private _ilines:ILine[] = [];
    private _prevIlines:ILine[] = [];
    private _saveBtn:HTMLElement | null = null;
    private _file:IFile = null!;    
    private _tempStagedFilePath = '';    
    private _changeUitl: ChangeUtils = null!;
    private _indexLastUpdated = '';
    constructor(containerSelector:string,changeUtil: ChangeUtils){
        super(containerSelector);
        this._changeUitl = changeUtil;
        this.saveHandler = success => this.onSave(success);
        this.onSync = () => this.updateDiff();
    }

    protected override getPlugins(){
        return [this.getHighlightPlugin(), ...super.getPlugins()];
    }

    protected override handleTransaction(transaction: Transaction) {
        super.handleTransaction(transaction);
        if(transaction.docChanged){
            const savebtn = this.saveBtn();
            if(this.IsDocChanged()){            
                savebtn?.classList.remove("d-none");
            }else{
                savebtn?.classList.add("d-none");
            }
        }
    }

    protected override renderLineNumbers(){
        const lineElems:string[] = [];
        let lineNo = 1;
        for(let i =0;i < this._ilines.length;i++){
            const line = this._ilines[i];
            let text = "<br/>";

            if(line.text !== undefined){
                text = lineNo+"";     
                lineNo++;
            }

            lineElems.push(`<p class="d-flex"><span>${text}</span></p>`);
        }
        const lineNumbers = this.getLineNumberContainer();
        if(!lineNumbers) return;
        //TODO: use fit-content for width and set the width of lineNumbers container to fit the line numbers, this way we can avoid setting a fixed width and also avoid the issue of line numbers getting cut off when there are more lines
        lineNumbers.style.width = `${String(this.lineCount).length + 2}ch`;
        //TODO: optimize this by only adding/removing the required line numbers instead of re-rendering all of them
        lineNumbers.innerHTML = lineElems.join(""); 
        
        this.renderHunkActions();
    }

    private renderHunkActions(){
        const actionElems:string[] = [];
        let isChange = false;
        const undoIcon = UiUtils.JsxToHtml(FaUndo({}));
        for(let i =0;i < this._ilines.length;i++){
            const line = this._ilines[i];
            let actionUi = '<br/>';

            if((line.text === undefined || line.hightLightBackground)){
                if(!isChange){
                    actionUi = `<span class="hunk-actions d-flex" data-iline="${i}">
                        <span class="bg-success px-1 hover stage-hunk" title="stage this change">+</span>
                        <span class="discard-hunk-container d-none position-relative">
                            <span class="position-absolute top-0 start-0 d-flex" title="discard this change">
                                <span class="ps-1"></span> 
                                <span class="discard-hunk bg-danger px-1" title="discard this change" data-iline="${i}">${undoIcon}</span>
                            </span>
                        </span>
                    </span>`;
                }
                isChange = true;
            }else{
                isChange = false;
            }
            actionElems.push(`<p class="d-flex">${actionUi}</p>`);
        }

        const container = this.getHunkActionContainer();
        container!.innerHTML = actionElems.join("");

        document.querySelectorAll<HTMLElement>(".stage-hunk").forEach((elem:HTMLElement)=>{
            elem.addEventListener("click",(e)=>{
                const ilineIndex = Number(elem.parentElement?.getAttribute('data-iline'));
                console.log("clicked ilineIndex",ilineIndex);
                this.stageHunk(ilineIndex);
            })
        })
        //discard-hunk
        document.querySelectorAll<HTMLElement>(".discard-hunk").forEach((elem:HTMLElement)=>{
            elem.addEventListener("click",(_e)=>{
                const ilineIndex = Number(elem.getAttribute('data-iline'));
                this.discardHunk(ilineIndex);
            })
        })
    }

    private async stageHunk(ilineIndex:number){
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
        const text = currentHunkTexts.map(x=> x.text).join(this._lineFeedType);
        const change = {
            text:text,            
        } as IChange;
        
        const preTrLineCount = this._prevIlines.slice(0,ilineIndex).filter(l => l.text === undefined).length;        

        if(ilineIndex - preTrLineCount > 0){
            change.startlineIndex = ilineIndex - preTrLineCount - 1;
            change.startOffset = Number.MAX_SAFE_INTEGER;
        }else{
            change.startlineIndex = ilineIndex - preTrLineCount;
            change.startOffset = 0;            
        }

        change.endlineIndex = change.startlineIndex + preHunkTexts.length;
        change.endOffset = change.startOffset;

        if(currentHunkTexts.length){
            if(change.startOffset > 0){
                change.text = this._lineFeedType + change.text;
            }else{
                change.text += this._lineFeedType;
            }
        }
                        
        const r = await IpcUtils.trackFileChanges(this._tempStagedFilePath,[change],this._encoding);
        if(r.error)
            return;
        const r2 = await IpcUtils.getRaw(["hash-object","-w", this._tempStagedFilePath]);
        if(r2.error)
            return;

        const hash = r2.result?.trim()!;

        const r3 = await IpcUtils.getRaw(["update-index","--add","--cacheinfo","100644",hash, this._file.path]);
        if(r3.error)
            return;
        
        await this.updateDiff();
        
        GitUtils.getStatus();
    }

    private async discardHunk(ilineIndex:number){
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

        this.applyChange(change);
    }    

    
    private async updateDiff(){                
        const options = ["-c", "core.autocrlf=false", "diff","--diff-algorithm=minimal","--ignore-cr-at-eol","--no-index", this._tempStagedFilePath, this._tempFilePath];
        const r = await IpcUtils.getRaw(options);        
        const diffResult = r.result!;
        const contentLines = this.getContentLines();
        const uiLines = DiffUtils.GetUiLines(diffResult,contentLines);
        this._ilines = uiLines.currentLines;
        this._changeUitl.previousLines = uiLines.previousLines;
        this._changeUitl.updatePreviousChanges(uiLines.previousLines);
        ReduxUtils.dispatch(ActionChanges.updateData({totalStep:this._changeUitl.totalChangeCount,silentStepUpdate:true}));
        //build decorations again with new ilines
        this.renderLineNumbers();
        const tr = this._editView.state.tr;
        tr.setMeta(TransMetaData.DecorationChanged,true);        
        this._editView.dispatch(tr);

    }
    

    private onSave(success:boolean){
        ReduxUtils.dispatch(ActionUI.setSync(undefined));
        
        if(success){
            this._saveBtn?.classList.add("d-none");
            ModalData.appToast.message = "Saved successfully.";
            ReduxUtils.dispatch(ActionModals.showToast());
        }else{
            ModalData.appToast.message = "Failed to save changes.";
            ReduxUtils.dispatch(ActionModals.showToast());
        }
    }

    private saveBtn(){
        if(!this._saveBtn || !this._saveBtn.isConnected){
            this._saveBtn = document.querySelector(`${this._containerSelector}`)?.closest(".diff-view")?.querySelector(".save-btn-container")!;
            this._saveBtn.addEventListener('click',() => {
                ReduxUtils.dispatch(ActionUI.setSync({text:"Saving changes..."}));
                this.save();
            });
        }
        return this._saveBtn;
    }

    protected override async readFile(){
        const succeeded = await super.readFile();
        if(!succeeded) return false;
        const options =  ["--diff-algorithm=minimal",this._file.path];
        const diff = await IpcUtils.getDiff(options);
        let lineConfigs = DiffUtils.GetUiLines(diff,this._lines);
        this._ilines = lineConfigs.currentLines;
        this._prevIlines = lineConfigs.previousLines;
        return true;
    }

    async renderILines(file:IFile){
        this._file = file;        
        const filePath = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path,this._file.path);
        await this.copyStagedContent();
        this._changeUitl.currentLines = [];
        this._changeUitl.previousLines = [];
        this._changeUitl.showChanges();
        const r = await this.render(filePath);
        this._changeUitl.updatePreviousChanges(this._prevIlines);        
        return r;
    }

    private async copyStagedContent(){
        const fileExtension = StringUtils.GetFileExtension(this._file.path);
        const tempStagedFileName = `temp_staged_${fileExtension}`;
        this._tempStagedFilePath = IpcUtils.joinPath(Data.appData.tempPath, tempStagedFileName);
        const r = await IpcUtils.copyStagedContent(this._file.path, this._tempStagedFilePath);
        this._indexLastUpdated = new Date().toISOString();
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