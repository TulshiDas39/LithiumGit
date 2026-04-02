import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { ReplaceStep } from "prosemirror-transform";
import {EditorView, DecorationSet, Decoration} from "prosemirror-view"
import {Schema, Node} from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { ILine } from "../../interfaces";

export class ChangeEditor extends TextEditor{
    private _ilines:ILine[] = [];
    private _saveBtn:HTMLElement | null = null;
    constructor(containerSelector:string){
        super(containerSelector);
    }

    protected override getPlugins(){
        return [this.getHighlightPlugin(), ...super.getPlugins()];
    }

    protected override handleTransaction(transaction: Transaction) {
        //check if the transaction is a change transaction by checking if the doc has changed and if the new doc is different from the old doc, we can do this by comparing the old and new doc's text content, if they are different then it's a change transaction
        if(transaction.docChanged){
            console.log("Document changed");
            for(let i = 0; i < transaction.steps.length; i++){
                const step = transaction.steps[i];
                if(step instanceof ReplaceStep){
                    const insertedText = step.slice.content.textBetween(0, step.slice.content.size);
                    const deletedCount = step.to - step.from;
                    const $pos = transaction.docs[i].resolve(step.from);
                    const paragraphIndex = $pos.index(0);
                    const indexInParagraph = $pos.parentOffset;

                }
            }
        }
        //const oldText = this._editView.state.doc.textContent;
        super.handleTransaction(transaction);
        const savebtn = this.saveBtn();
        if(this.IsDocChanged()){            
            savebtn?.classList.remove("d-none");
        }else{
            savebtn?.classList.add("d-none");
        }
    }

    private saveBtn(){
        if(!this._saveBtn){
            this._saveBtn = document.querySelector(`${this._containerSelector}`)?.closest(".diff-view")?.querySelector(".save-btn-container")!;
        }
        return this._saveBtn;
    }

    renderILines(lines:ILine[]){
        this._ilines = lines;
        this._lines = this._ilines.map(l => l.text || '');
        this.render();        
    }

    private getHighlightPlugin(){
        const buildDecorations = (doc: Node) => {
            const decorations: Decoration[] = [];
            doc.forEach((node: Node, offset: number, index: number) => {
                const iline = this._ilines[index];
                //TODO: null check not required after we make sure ilines are always in sync with lines, but for safety we can keep it for now
                if(!iline) return;
                if(iline.hightLightBackground){
                    decorations.push(Decoration.node(offset, offset + node.nodeSize, { class: 'bg-current-change' }));
                    for(let i=0; i<iline.textHightlightIndex.length; i++){
                        const range = iline.textHightlightIndex[i];
                        const start = offset + 1 + range.fromIndex;
                        const end = start + range.count;
                        decorations.push(Decoration.inline(start, end, { class: 'bg-current-change-deep' }));
                    }
                }
                if(iline.text === undefined){
                    decorations.push(Decoration.node(offset, offset + node.nodeSize, { class: 'transparent-background noselect',contenteditable:"false" }));
                }
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