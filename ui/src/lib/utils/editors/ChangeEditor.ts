import { EditorState, Plugin, Transaction } from "prosemirror-state";
import {EditorView, DecorationSet, Decoration} from "prosemirror-view"
import {Schema, Node} from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { ILine } from "../../interfaces";

export class ChangeEditor extends TextEditor{
    private _ilines:ILine[] = [];
    constructor(containerSelector:string){
        super(containerSelector);
    }

    protected override getPlugins(){
        return [this.getOddLinePlugin(), ...super.getPlugins()];
    }

    renderILines(lines:ILine[]){
        this._ilines = lines;
        this._lines = this._ilines.map(l => l.text || '');
        this.render();        
    }

    private getOddLinePlugin(){
        const buildDecorations = (doc: Node) => {
            const decorations: Decoration[] = [];
            doc.forEach((node: Node, offset: number, index: number) => {
                const iline = this._ilines[index];
                if(iline.hightLightBackground){
                    decorations.push(Decoration.node(offset, offset + node.nodeSize, { class: 'bg-current-change' }));
                    // node.forEach((_child, _childOffset) => {                      
                        for(let i=0; i<iline.textHightlightIndex.length; i++){
                            const range = iline.textHightlightIndex[i];
                            const start = offset + 1 + range.fromIndex;
                            const end = start + range.count;
                            decorations.push(Decoration.inline(start, end, { class: 'bg-current-change-deep h-100' }));
                        }
                    // });
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