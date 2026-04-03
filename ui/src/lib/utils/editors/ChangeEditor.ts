import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { ReplaceStep } from "prosemirror-transform";
import {EditorView, DecorationSet, Decoration} from "prosemirror-view"
import {Schema, Node} from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { ILine } from "../../interfaces";
import { IChange, IFile } from "common_library";
import { IpcUtils } from "../IpcUtils";
import { RepoUtils } from "../RepoUtils";
import { DataUtils } from "../DataUtils";
import { Data } from "../../data";

export class ChangeEditor extends TextEditor{
    private _ilines:ILine[] = [];
    private _saveBtn:HTMLElement | null = null;
    private _file:IFile = null!;
    //private _tempFilePath = Data.
    constructor(containerSelector:string){
        super(containerSelector);        
    }

    protected override getPlugins(){
        return [this.getHighlightPlugin(), ...super.getPlugins()];
    }

    protected override handleTransaction(transaction: Transaction) {
        //check if the transaction is a change transaction by checking if the doc has changed and if the new doc is different from the old doc, we can do this by comparing the old and new doc's text content, if they are different then it's a change transaction
        let changes:IChange[] = [];
        if(transaction.docChanged){
            console.log("Document changed");
            //changes = this.populateChanges(transaction);            
            this.updateILines(transaction);
        }
        //const oldText = this._editView.state.doc.textContent;
        super.handleTransaction(transaction);
        if(changes.length) {
            this.handleChanges(changes);
        }
        const savebtn = this.saveBtn();
        if(this.IsDocChanged()){            
            savebtn?.classList.remove("d-none");
        }else{
            savebtn?.classList.add("d-none");
        }
    }

    private updateILines(transaction: Transaction){
        for(let i = 0; i < transaction.steps.length; i++){
                const step = transaction.steps[i];
                if(step instanceof ReplaceStep){
                    const insertedText = step.slice.content.textBetween(0, step.slice.content.size);
                    console.log("Inserted text:", insertedText);
                    const insertedLines = insertedText.split(/\r?\n/);
                    console.log("Line count:", insertedLines.length);
                    const deletedCount = step.to - step.from;
                    const $pos = transaction.docs[i].resolve(step.from);
                    const $posTo = transaction.docs[i].resolve(step.to);
                    const lineIndexFrom = $pos.index(0);
                    const lineIndexTo = $posTo.index(0);
                    console.log("Paragraph index from:", lineIndexFrom, "to:", lineIndexTo);
                    const lineOffsetFrom = $pos.parentOffset;
                    const lineOffsetTo = $posTo.parentOffset;
                    console.log("Index in from paragraph:", lineOffsetFrom, "to:", lineOffsetTo);
                    if(step.from != step.to){
                        console.log("Deletion detected");
                        for(let lineIndex = lineIndexFrom; lineIndex < lineIndexTo; lineIndex++){
                            this._lines.splice(lineIndex,1);                            
                        }
                        this._ilines[lineIndexTo].text = this._ilines[lineIndexTo].text?.slice(lineOffsetTo) || '';
                    }
                    
                    if(insertedLines.length){
                        this._ilines[lineIndexFrom].text += insertedLines[0];
                        for(let i=1; i<insertedLines.length; i++){
                            const newILine: ILine = {text: insertedLines[i], hightLightBackground: false,
                                textHightlightIndex: []};
                            this._ilines.splice(lineIndexFrom + i, 0, newILine);
                        }
                    }

                }
            }
    }

    private populateChanges(transaction: Transaction){
        const changeMap = new Map<number, IChange>(); // keyed by final paragraph index
        for (let i = 0; i < transaction.steps.length; i++) {
            const step = transaction.steps[i];
            if (!(step instanceof ReplaceStep)) continue;

            const insertedText = step.slice.content.textBetween(0, step.slice.content.size);
            const deletedCount = step.to - step.from;
            
            // Map this step's `from` position into the FINAL document coordinates
            const finalFrom = transaction.mapping.slice(i + 1).map(step.from);

            const $pos = transaction.doc.resolve(finalFrom);
            const paragraphIndex = $pos.index(0);
            const indexInParagraph = $pos.parentOffset;

            if (changeMap.has(paragraphIndex)) {
                // Merge into existing change for this paragraph
                const existing = changeMap.get(paragraphIndex)!;
                existing.text += insertedText;
                existing.deleteCount += deletedCount;
            } else {
                changeMap.set(paragraphIndex, {
                    lineIndex: paragraphIndex,
                    offset: indexInParagraph,
                    text: insertedText,
                    deleteCount: deletedCount,
                });
            }
        }

        return Array.from(changeMap.values());
    }

    private handleChanges(changes:IChange[]){
        
    }

    private saveBtn(){
        if(!this._saveBtn){
            this._saveBtn = document.querySelector(`${this._containerSelector}`)?.closest(".diff-view")?.querySelector(".save-btn-container")!;
        }
        return this._saveBtn;
    }

    renderILines(lines:ILine[],file:IFile){
        this._file = file;
        this.createTempFile();
        this._ilines = lines;
        this._lines = this._ilines.map(l => l.text || '');
        this.render();        
    }

    createTempFile(){
        const fullPath = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path, this._file.path);
        // IpcUtils.copyFile(fullPath, this._file.content);
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