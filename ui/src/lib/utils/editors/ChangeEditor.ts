import { Plugin, Transaction } from "prosemirror-state";
import {EditorView, DecorationSet, Decoration} from "prosemirror-view"
import {Schema, Node} from "prosemirror-model"
import { TextEditor } from "./TextEditor";

export class ChangeEditor extends TextEditor{
    constructor(containerSelector:string){
        super(containerSelector);
    }

    protected override getPlugins(){
        return [this.getOddLinePlugin(), ...super.getPlugins()];
    }

    private getOddLinePlugin(){
        const buildDecorations = (doc: Node) => {
            const decorations: Decoration[] = [];
            doc.forEach((node: Node, offset: number, index: number) => {
                if(index % 2 === 0){
                    decorations.push(Decoration.node(offset, offset + node.nodeSize, { class: 'pm-odd-line' }));
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
                decorations(state: any) { return this.getState(state); },
            },
        });
    }
}