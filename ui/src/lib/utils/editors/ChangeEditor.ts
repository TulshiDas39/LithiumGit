import { EditorState, Plugin, Transaction } from "prosemirror-state";
import {DecorationSet, Decoration} from "prosemirror-view"
import {Node} from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { ILine } from "../../interfaces";
import { IFile, StringUtils } from "common_library";
import { IpcUtils } from "../IpcUtils";
import { RepoUtils } from "../RepoUtils";
import { ReduxUtils } from "../ReduxUtils";
import { ActionUI } from "../../../store/slices/UiSlice";
import { ActionModals } from "../../../store";
import { ModalData } from "../../../components/modals/ModalData";
import { Data } from "../../data";
import { DiffUtils } from "../DiffUtils";


export class ChangeEditor extends TextEditor{
    private _ilines:ILine[] = [];
    private _saveBtn:HTMLElement | null = null;
    private _file:IFile = null!;
    private _diffUpdateTimer: NodeJS.Timeout | null = null;
    private _tempStagedFilePath = '';
    private _haveDecorationUpdate = false;
    constructor(containerSelector:string){
        super(containerSelector);
        this.saveHandler = success => this.onSave(success);
        this.onSync = () => this.updateDiffDebounced();

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

    private updateDiffDebounced(){
        if(this._diffUpdateTimer){
            clearTimeout(this._diffUpdateTimer);
        }
        this._diffUpdateTimer = setTimeout(() => {
            this.updateDiff();
        }, 1000);
    }

    private updateDiff(){
        // const result = await git.diff(["--word-diff=porcelain","--word-diff-regex=.","--diff-algorithm=minimal","--no-index", tmpFile, externalFilePath]);
        console.log("Updating diff with content from editor...");
        // const options =  ["--word-diff=porcelain", "--word-diff-regex=.","--diff-algorithm=minimal",filePath];
        const options = ["-c", "core.autocrlf=false", "diff","--diff-algorithm=minimal","--ignore-cr-at-eol","--no-index", this._tempStagedFilePath, this._tempFilePath];
        IpcUtils.getRaw(options).then((r) => {
            const diffResult = r.result!;
            console.log("Diff result received", diffResult);
            console.log("diff error", r.error);
            const contentLines = this.getContentLines();
            console.log("Content lines from editor", contentLines);
            const uiLines = DiffUtils.GetUiLines(diffResult,contentLines);
            console.log("UI lines after diff", uiLines);
            this._ilines = uiLines.currentLines;
            console.log("Diff updated",this._ilines);
            //build decorations again with new ilines
            const tr = this._editView.state.tr;
            this._haveDecorationUpdate = true;
            this._editView.dispatch(tr);            
        });
        this._diffUpdateTimer = null;

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

    async renderILines(lines:ILine[],file:IFile){
        this._file = file;
        await this.saveStagedContent();
        this._ilines = lines;
        this._lines = this._ilines.filter(x=>x.text !== undefined).map(l => l.text || '');
        console.log("Rendering ChangeEditor with lines", this._lines);
        const sourceFilePath = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path, this._file.path);
        return await this.render(sourceFilePath);             
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