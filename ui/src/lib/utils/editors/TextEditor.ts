import { EnumLinefeed } from "common_library";
import { Data } from "../../data";
import {Schema, Node, Slice, Fragment} from "prosemirror-model"
import {EditorState, Transaction, Command} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {undo, redo, history} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {baseKeymap} from "prosemirror-commands"




export class TextEditor {
    protected _containerSelector:string = '';    
    protected _lines:string[] = [];
    private _lineFeedType:EnumLinefeed = EnumLinefeed.LF;
    private _encoding:string = 'utf-8';
    private readonly _systemLineFeedType:EnumLinefeed = EnumLinefeed.CRLF;
    protected _editState:EditorState = null!;
    protected _editView:EditorView = null!;
    private _schema:Schema= null!;
    private _initialDoc: Node = null!;

    constructor(containerSelector:string){
        this._containerSelector = containerSelector; 
        this._systemLineFeedType = Data.systemLineFeedType;    
        this._schema = this.getSchema();   
    }

    setContent(content:string){        
        this._lines = content?.split('\n') || [];
        return this;
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

    protected handleTransaction (transaction: Transaction){
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
        //TODO: use fit-content for width and set the width of lineNumbers container to fit the line numbers, this way we can avoid setting a fixed width and also avoid the issue of line numbers getting cut off when there are more lines
        lineNumbers.style.width = `${String(lineCount).length + 2}ch`;
        //TODO: optimize this by only adding/removing the required line numbers instead of re-rendering all of them
        lineNumbers.innerHTML = Array.from({length: lineCount}, (_, i) => `<p>${i + 1}</p>`).join("");
    }

    private readonly insertTab: Command = (state, dispatch) => {
        dispatch?.(state.tr.insertText("\t"));
        return true;
    };


    protected getPlugins(){
        return [history(),
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
                    toDOM: () => ["div", { style: "white-space: pre" }, 0] as any,
                    parseDOM: [{ tag: "div" }],
                },
                text: { inline: true },
            }
        });
    }

    private handlePaste(view: EditorView, event: ClipboardEvent) {
        const text = event.clipboardData?.getData('text/plain');
        if (!text) return false;
        const lines = text.split(/\r?\n/);
        const { state } = view;
        const { schema } = state;
        const nodes = lines.map(line =>
            schema.node('paragraph', null, line ? [schema.text(line)] : [])
        );
        const slice = new Slice(Fragment.from(nodes), 1, 1);
        view.dispatch(state.tr.replaceSelection(slice));
        return true;
    }

    protected IsDocChanged(){
        return !this._editView.state.doc.eq(this._initialDoc);
    }

    protected render(){
        const doc = this.createDocument();        
        this._editState = EditorState.create({schema:this._schema, doc, plugins:this.getPlugins()});
        this._editView = new EditorView(document.querySelector(this._containerSelector)!, {
            state:this._editState,
            dispatchTransaction:(tr) => this.handleTransaction(tr),
            attributes: { spellcheck: "false", style: `width: fit-content` },
            clipboardTextSerializer: (slice) => slice.content.textBetween(0, slice.content.size, "\n"),
            handlePaste: (view, event) => this.handlePaste(view, event),
        });
        this._initialDoc = this._editView.state.doc;

        this.renderLineNumbers(this._editState.doc.childCount);
    } 

}