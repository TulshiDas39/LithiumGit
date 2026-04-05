import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { ReplaceStep } from "prosemirror-transform";
import {EditorView, DecorationSet, Decoration} from "prosemirror-view"
import {Schema, Node} from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { ILine } from "../../interfaces";
import { IChange, IFile, StringUtils } from "common_library";
import { IpcUtils } from "../IpcUtils";
import { RepoUtils } from "../RepoUtils";
import { DataUtils } from "../DataUtils";
import { Data } from "../../data";
import { Mapping } from 'prosemirror-transform';


export class ChangeEditor extends TextEditor{
    private _ilines:ILine[] = [];
    private _saveBtn:HTMLElement | null = null;
    private _file:IFile = null!;
    // private _untrackedTransactions: Transaction[] = [];
    private _untrackedChanges: IChange[] = [];
    private _trackingChanges = false;
    private _tempFilePath = '';
    constructor(containerSelector:string){
        super(containerSelector);        
    }

    protected override getPlugins(){
        return [this.getHighlightPlugin(), ...super.getPlugins()];
    }

    protected override handleTransaction(transaction: Transaction) {
        //check if the transaction is a change transaction by checking if the doc has changed and if the new doc is different from the old doc, we can do this by comparing the old and new doc's text content, if they are different then it's a change transaction
        
        //const oldText = this._editView.state.doc.textContent;
        super.handleTransaction(transaction);
        if(transaction.docChanged){
            console.log("Document changed");
            //changes = this.populateChanges(transaction); 
            // this._untrackedTransactions.push(transaction);           
            // this.updateILines(transaction);
            // this.populateChangesAcrossTransactions();
            this.populateChanges(transaction);

            const savebtn = this.saveBtn();
            if(this.IsDocChanged()){            
                savebtn?.classList.remove("d-none");
            }else{
                savebtn?.classList.add("d-none");
            }
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
        for (let i = 0; i < transaction.steps.length; i++) {
            const step = transaction.steps[i];
            if (!(step instanceof ReplaceStep)) continue;

            const insertedText = step.slice.content.textBetween(0, step.slice.content.size);

            const $posFrom = transaction.docs[i].resolve(step.from);
            const $posTo = transaction.docs[i].resolve(step.to);
            const lineIndexFrom = $posFrom.index(0);
            const lineIndexTo = $posTo.index(0);
            const parentOffsetFrom = $posFrom.parentOffset;
            const parentOffsetTo = $posTo.parentOffset;

            const change:IChange = {
                startlineIndex: lineIndexFrom,
                startOffset: parentOffsetFrom,
                endlineIndex: lineIndexTo,
                endOffset: parentOffsetTo,
                text: insertedText,
            };
            this._untrackedChanges.push(change);            
        }
        this.trackChanges();
    }

    private trackChanges(){
        if(this._trackingChanges || this._untrackedChanges.length === 0)
            return;

        this._trackingChanges = true;
        const perform = ()=>{
            const itemCount = this._untrackedChanges.length;
            IpcUtils.trackFileChanges(this._tempFilePath, this._untrackedChanges).then((result)=>{
                if(result.error){
                    console.error("Error tracking changes:", result.error);
                    this._trackingChanges = false;
                }else{
                    this._untrackedChanges.splice(0,itemCount);
                    if(this._untrackedChanges.length) {
                        perform();
                    }
                    else {
                        this._trackingChanges = false;
                    }
                }
            });
        }
        perform();

    }


    // private populateChangesAcrossTransactions() {
    //     const transactions = this._untrackedTransactions;
    //     const lastDoc = transactions[transactions.length - 1].doc; // final doc
    //     const changeMap = new Map<number, IChange>();

    //     for (let t = 0; t < transactions.length; t++) {
    //         const transaction = transactions[t];

    //         // Build mapping: end of transaction t → final doc
    //         // (append all transactions AFTER t)
    //         const suffixMapping = new Mapping();
    //         for (let k = t + 1; k < transactions.length; k++) {
    //             suffixMapping.appendMapping(transactions[k].mapping);
    //         }

    //         for (let i = 0; i < transaction.steps.length; i++) {
    //             const step = transaction.steps[i];
    //             if (!(step instanceof ReplaceStep)) continue;

    //             const insertedText = step.slice.content.textBetween(0, step.slice.content.size);
    //             const deletedCount = step.to - step.from;

    //             // Step 1: map step.from to end of current transaction
    //             const posAtEndOfTr = transaction.mapping.slice(i + 1).map(step.from);
    //             // Step 2: map through all subsequent transactions → final doc position
    //             const finalPos = suffixMapping.map(posAtEndOfTr);

    //             const $pos = lastDoc.resolve(finalPos); // ← always final doc
    //             const paragraphIndex = $pos.index(0);
    //             const parentOffset = $pos.parentOffset;

            
    //         }
    //     }

    //     const arr = Array.from(changeMap.values());
    //     console.log("Aggregated changes across transactions:", arr);
    //     return arr;
    // }

    

    private saveBtn(){
        if(!this._saveBtn){
            this._saveBtn = document.querySelector(`${this._containerSelector}`)?.closest(".diff-view")?.querySelector(".save-btn-container")!;
        }
        return this._saveBtn;
    }

    async renderILines(lines:ILine[],file:IFile){
        this._file = file;
        const success = await this.createTempFile();
        this._ilines = lines;
        this._lines = this._ilines.map(l => l.text || '');
        this.render();
        if(!success) return false;
        return true;        
    }

    async createTempFile(){
        const sourceFilePath = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path, this._file.path);
        const fileExtension = StringUtils.GetFileExtension(this._file.path);
        const tempFileName = `temp${fileExtension}`;
        const tempFilePath = IpcUtils.joinPath(Data.appData.tempPath, tempFileName);
        this._tempFilePath = tempFilePath;
        const r = await IpcUtils.copyFile(sourceFilePath, tempFilePath,false);
        console.log("Copy file result:", r);
        if(r.error)
            return false;
        return true;
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