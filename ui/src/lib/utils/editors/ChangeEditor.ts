import { EditorState, Plugin, Transaction } from "prosemirror-state";
import {DecorationSet, Decoration} from "prosemirror-view"
import {Node} from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { ILine } from "../../interfaces";
import { IFile } from "common_library";
import { IpcUtils } from "../IpcUtils";
import { RepoUtils } from "../RepoUtils";


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
            console.log("Document changed");
            const savebtn = this.saveBtn();
            if(this.IsDocChanged()){            
                savebtn?.classList.remove("d-none");
            }else{
                savebtn?.classList.add("d-none");
            }
        }
    }

    // private updateILines(transaction: Transaction){
    //     for(let i = 0; i < transaction.steps.length; i++){
    //             const step = transaction.steps[i];
    //             if(step instanceof ReplaceStep){
    //                 const insertedText = step.slice.content.textBetween(0, step.slice.content.size, '\n');
    //                 console.log("Inserted text:", insertedText);
    //                 const insertedLines = insertedText.split(/\r?\n/);
    //                 console.log("Line count:", insertedLines.length);
    //                 const $pos = transaction.docs[i].resolve(step.from);
    //                 const $posTo = transaction.docs[i].resolve(step.to);
    //                 const lineIndexFrom = $pos.index(0);
    //                 const lineIndexTo = $posTo.index(0);
    //                 console.log("Paragraph index from:", lineIndexFrom, "to:", lineIndexTo);
    //                 const lineOffsetFrom = $pos.parentOffset;
    //                 const lineOffsetTo = $posTo.parentOffset;
    //                 console.log("Index in from paragraph:", lineOffsetFrom, "to:", lineOffsetTo);
    //                 if(step.from != step.to){
    //                     console.log("Deletion detected");
    //                     for(let lineIndex = lineIndexFrom; lineIndex < lineIndexTo; lineIndex++){
    //                         this._lines.splice(lineIndex,1);                            
    //                     }
    //                     this._ilines[lineIndexTo].text = this._ilines[lineIndexTo].text?.slice(lineOffsetTo) || '';
    //                 }
                    
    //                 if(insertedLines.length){
    //                     this._ilines[lineIndexFrom].text += insertedLines[0];
    //                     for(let i=1; i<insertedLines.length; i++){
    //                         const newILine: ILine = {text: insertedLines[i], hightLightBackground: false,
    //                             textHightlightIndex: []};
    //                         this._ilines.splice(lineIndexFrom + i, 0, newILine);
    //                     }
    //                 }

    //             }
    //         }
    // }
    

    private saveBtn(){
        if(!this._saveBtn){
            this._saveBtn = document.querySelector(`${this._containerSelector}`)?.closest(".diff-view")?.querySelector(".save-btn-container")!;
        }
        return this._saveBtn;
    }

    async renderILines(lines:ILine[],file:IFile){
        this._file = file;
        this._ilines = lines;
        this._lines = this._ilines.map(l => l.text || '');
        const sourceFilePath = IpcUtils.joinPath(RepoUtils.repositoryDetails.repoInfo.path, this._file.path);
        return await this.render(sourceFilePath);             
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