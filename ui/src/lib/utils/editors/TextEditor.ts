import { EnumLinefeed } from "common_library";
import { IpcUtils } from "../IpcUtils";
import { Data } from "../../data";
import { ILine } from "../../interfaces";
import {Schema, Node} from "prosemirror-model"
import {EditorState, Transaction, Command, Plugin} from "prosemirror-state"
import {EditorView, DecorationSet, Decoration} from "prosemirror-view"
import {undo, redo, history} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {baseKeymap} from "prosemirror-commands"
import { DiffUtils } from "../DiffUtils";




export class TextEditor {
    private _containerSelector:string = '';    
    private _lines:string[] = [];
    private _lineFeedType:EnumLinefeed = EnumLinefeed.LF;
    private _encoding:string = 'utf-8';
    private readonly _systemLineFeedType:EnumLinefeed = EnumLinefeed.CRLF;
    private _editState:EditorState = null!;
    private _editView:EditorView = null!;
    private _schema:Schema= null!;
    constructor(containerSelector:string){
        this._containerSelector = containerSelector; 
        this._systemLineFeedType = Data.systemLineFeedType;    
        this._schema = this.getSchema();   
    }

    setContent(content:string){        
        this._lines = content?.split('\n') || [];
        return this;
    }

    renderILines(lines:ILine[]){
        this._lines = lines.map(l=>l.text || '');
        this.render();        
    }

    private createDocument(){
        const paragraphs:Node[] =  [];
        for(let line of this._lines){
            const p = this._schema.node('paragraph', null, line? [this._schema.text(line)]:[]);
            paragraphs.push(p);
        }
        const doc = this._schema.node('doc', null, paragraphs);
        return doc;
    }

    private handleTransaction = (transaction: Transaction)=>{
        const prevLineCount = this._editView.state.doc.childCount;
        let newState = this._editView.state.apply(transaction);
        this._editView.updateState(newState);
        if(transaction.docChanged && newState.doc.childCount !== prevLineCount){
            this.renderLineNumbers(newState.doc.childCount);
        }
    }

    private renderLineNumbers(lineCount: number){
        const currentPanel = document.querySelector(this._containerSelector)?.closest(".current");
        const lineNumbers = currentPanel?.querySelector(".line_numbers") as HTMLElement | null;
        if(!lineNumbers) return;
        lineNumbers.style.width = `${String(lineCount).length + 2}ch`;
        lineNumbers.innerHTML = Array.from({length: lineCount}, (_, i) => `<p>${i + 1}</p>`).join("");
    }

    private readonly insertTab: Command = (state, dispatch) => {
        dispatch?.(state.tr.insertText("\t"));
        return true;
    };

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

    protected getPlugins(){
        return [this.getOddLinePlugin(), history(),
            keymap({
                "Mod-z": undo,
                "Mod-y": redo,              
                "Tab": this.insertTab,
            }),
            keymap(baseKeymap),
        ];
    }


    protected getSchema(){
        return new Schema({
            nodes: {
                doc: { content: "paragraph+" },
                paragraph: {
                    content: "text*",
                    whitespace: "pre",
                    toDOM: () => ["p", { style: "white-space: pre" }, 0] as any,
                    parseDOM: [{ tag: "p" }],
                },
                text: { inline: true },
            }
        });
    }

    private render(){
        const doc = this.createDocument();        
        this._editState = EditorState.create({schema:this._schema, doc, plugins:this.getPlugins()});
        this._editView = new EditorView(document.querySelector(this._containerSelector)!, {
            state:this._editState,
            dispatchTransaction:this.handleTransaction,
            attributes: { spellcheck: "false", style: `width: fit-content` },
        });
        this.renderLineNumbers(this._editState.doc.childCount);
    } 

}