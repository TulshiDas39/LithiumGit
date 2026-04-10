import { EditorState, Plugin, Transaction } from "prosemirror-state";
import {DecorationSet, Decoration} from "prosemirror-view"
import {Node} from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { ILine } from "../../interfaces";
import { IFile } from "common_library";
import { IpcUtils } from "../IpcUtils";
import { RepoUtils } from "../RepoUtils";
import { ReduxUtils } from "../ReduxUtils";
import { ActionUI } from "../../../store/slices/UiSlice";
import { ActionModals } from "../../../store";
import { ModalData } from "../../../components/modals/ModalData";


export class ChangeEditor extends TextEditor{
    private _ilines:ILine[] = [];
    private _saveBtn:HTMLElement | null = null;
    private _file:IFile = null!;
    constructor(containerSelector:string){
        super(containerSelector);        
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
    

    private saveBtn(){
        if(!this._saveBtn){
            this._saveBtn = document.querySelector(`${this._containerSelector}`)?.closest(".diff-view")?.querySelector(".save-btn-container")!;
            this._saveBtn.addEventListener('click',() => {
                ReduxUtils.dispatch(ActionUI.setSync({text:"Saving changes..."}));
                this.save().then((r)=>{
                    ReduxUtils.dispatch(ActionUI.setSync(undefined));
                    if(r){
                        this._saveBtn?.classList.add("d-none");
                        ModalData.appToast.message = "Saved successful.";
                        ReduxUtils.dispatch(ActionModals.showToast());
                    }else{
                        ModalData.appToast.message = "Failed to save changes.";
                        ReduxUtils.dispatch(ActionModals.showToast());
                    }
                });

            });
        }
        return this._saveBtn;
    }

    async renderILines(lines:ILine[],file:IFile){
        this._file = file;
        this._ilines = lines;
        this._lines = this._ilines.filter(x=>x.text !== undefined).map(l => l.text || '');
        const sourceFilePath = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path, this._file.path);
        return await this.render(sourceFilePath);             
    }


    private getHighlightPlugin(){
        const buildDecorations = (doc: Node) => {
            const decorations: Decoration[] = [];
            let ilineIndex = 0;
            doc.forEach((node: Node, offset: number, index: number) => {
                console.log("index",index,"ilineIndex",ilineIndex);
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
            return DecorationSet.create(doc, decorations);
        };
        return new Plugin({
            state: {
                init: (_: any, { doc }: {doc:Node}) => buildDecorations(doc),
                apply: (tr: Transaction, set: any) => tr.docChanged ? buildDecorations(tr.doc) : set,
            },
            props: {
                decorations(state: EditorState) { return this.getState(state); },
            },
        });
    }
}