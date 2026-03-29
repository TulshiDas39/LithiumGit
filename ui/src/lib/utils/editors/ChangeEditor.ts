import { EditorState, Plugin, Transaction } from "prosemirror-state";
import {EditorView, DecorationSet, Decoration} from "prosemirror-view"
import {Schema, Node} from "prosemirror-model"
import { TextEditor } from "./TextEditor";
import { ILine } from "../../interfaces";

export class ChangeEditor extends TextEditor{
    constructor(containerSelector:string){
        super(containerSelector);
    }

    protected override getPlugins(){
        return [this.getOddLinePlugin(), ...super.getPlugins()];
    }

    renderILines(lines:ILine[]){
        this._lines = lines.map(l=>l.text || '');
        this.render();        
    }

    private getOddLinePlugin(){
        const buildDecorations = (doc: Node) => {
            const decorations: Decoration[] = [];
            doc.forEach((node: Node, offset: number, index: number) => {
                if(index % 2 === 0){
                    decorations.push(Decoration.node(offset, offset + node.nodeSize, { class: 'pm-odd-line' }));
                    node.forEach((child, childOffset) => {
                        const start = offset + 1 + childOffset;
                        const end = start + 10;
                        decorations.push(Decoration.inline(start, end, { class: 'pm-highlight-line' }));
                    });
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