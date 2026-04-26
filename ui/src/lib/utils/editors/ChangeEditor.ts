import { EditorState, Plugin, Transaction } from "prosemirror-state";
import {DecorationSet, Decoration} from "prosemirror-view"
import {Node} from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { ILine } from "../../interfaces";
import { EnumChangeType, IFile, RendererEvents, StringUtils } from "common_library";
import { IpcUtils } from "../IpcUtils";
import { RepoUtils } from "../RepoUtils";
import { ReduxUtils } from "../ReduxUtils";
import { ActionUI } from "../../../store/slices/UiSlice";
import { ActionModals } from "../../../store";
import { ModalData } from "../../../components/modals/ModalData";
import { Data } from "../../data";
import { DiffUtils } from "../DiffUtils";
import { ChangeUtils } from "../ChangeUtils";
import { DataUtils } from "../DataUtils";


export class ChangeEditor extends TextEditor{
    private _ilines:ILine[] = [];
    private _prevIlines:ILine[] = [];
    private _saveBtn:HTMLElement | null = null;
    private _file:IFile = null!;    
    private _tempStagedFilePath = '';
    private _haveDecorationUpdate = false;
    private _changeUitl: ChangeUtils = null!;
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
        for(let line of this._ilines){
            let text = "<br/>";
            if(line.text !== undefined){
                text = lineNo+"";     
                lineNo++;
            }            
            lineElems.push(`<p>${text}</p>`);
        }
        const lineNumbers = this.getLineNumberContainer();
        if(!lineNumbers) return;
        //TODO: use fit-content for width and set the width of lineNumbers container to fit the line numbers, this way we can avoid setting a fixed width and also avoid the issue of line numbers getting cut off when there are more lines
        lineNumbers.style.width = `${String(this.lineCount).length + 2}ch`;
        //TODO: optimize this by only adding/removing the required line numbers instead of re-rendering all of them
        lineNumbers.innerHTML = lineElems.join("");
    }

    private updateDiff(){                
        const options = ["-c", "core.autocrlf=false", "diff","--diff-algorithm=minimal","--ignore-cr-at-eol","--no-index", this._tempStagedFilePath, this._tempFilePath];
        IpcUtils.getRaw(options).then((r) => {
            const diffResult = r.result!;
            const contentLines = this.getContentLines();
            const uiLines = DiffUtils.GetUiLines(diffResult,contentLines);
            this._ilines = uiLines.currentLines;
            this._changeUitl.previousLines = uiLines.previousLines;
            this._changeUitl.updatePreviousChanges(uiLines.previousLines);
            //build decorations again with new ilines
            this.renderLineNumbers();
            const tr = this._editView.state.tr;
            this._haveDecorationUpdate = true;
            this._editView.dispatch(tr);            
        });        

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

    protected override async readFile(filePath: string){
        const succeeded = await super.readFile(filePath);
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
        const filePath = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path,this._file.path);;
        const succeed = await this.readFile(filePath);
        if(!succeed) return false;
        await this.saveStagedContent();
        this._changeUitl.currentLines = [];
        this._changeUitl.previousLines = this._prevIlines;
        this._changeUitl.showChanges();
        const r = await this.render();
        ReduxUtils.dispatch(ActionUI.setLinefeedType(this._lineFeedType));
        ReduxUtils.dispatch(ActionUI.setEncoding(this._encoding));
        DataUtils.handleLFTypeChangeOfModifiedFile = () => this.switchLfType();
        DataUtils.handleEncodingChangeOfModifiedFile = (encoding) => this.switchEncoding(encoding);
        return r;
    }

    private saveStagedContent(){
        const fileExtension = StringUtils.GetFileExtension(this._file.path);
        const tempStagedFileName = `temp_staged_${fileExtension}`;
        this._tempStagedFilePath = IpcUtils.joinPath(Data.appData.tempPath, tempStagedFileName);
        return IpcUtils.copyStagedContent(this._file.path, this._tempStagedFilePath);
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
                if(iline.hightLightBackground){
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
            this._haveDecorationUpdate = false;
            return DecorationSet.create(doc, decorations);
        };

    private getHighlightPlugin(){
        
        return new Plugin({
            state: {
                init: (_: any, { doc }: {doc:Node}) => this.buildDecorations(doc),
                apply: (tr: Transaction, set: DecorationSet) => (tr.docChanged || this._haveDecorationUpdate) ? this.buildDecorations(tr.doc) : set,
            },
            props: {
                decorations(state: EditorState) { return this.getState(state); },
            },
        });
    }
}