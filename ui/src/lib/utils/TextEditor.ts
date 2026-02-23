import { EnumLinefeed } from "common_library";
import { IpcUtils } from "./IpcUtils";
import { Data } from "../data";
import { ILine } from "../interfaces";
import {schema} from "prosemirror-schema-basic"
import {EditorState, Transaction} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {undo, redo, history} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {baseKeymap} from "prosemirror-commands"




export class TextEditor {
    private _containerSelector:string = '';    
    private _lines:string[] = [];
    private _lineFeedType:EnumLinefeed = EnumLinefeed.LF;
    private _encoding:string = 'utf-8';
    private readonly _systemLineFeedType:EnumLinefeed = EnumLinefeed.CRLF;
    private _editState:EditorState = null!;
    private _editView:EditorView = null!;
    constructor(containerSelector:string){
        this._containerSelector = containerSelector; 
        this._systemLineFeedType = Data.systemLineFeedType;       
    }

    setContent(content:string){        
        this._lines = content?.split('\n') || [];
        return this;
    }

    renderILines(lines:ILine[]){
        this._lines = lines.map(l=>l.text || '');
        this.render();        
    }

    private handleTransaction = (transaction: Transaction)=>{
        console.log("Document size went from", transaction.before.content.size,
                "to", transaction.doc.content.size);
        let newState = this._editView.state.apply(transaction);
        this._editView.updateState(newState)
    }

    private getPlugins(){
        return [history(),
            keymap({
                "Mod-z": undo,
                "Mod-y": redo,              
            }),
            keymap(baseKeymap),
        ];
    }

    private render(){
        this._editState = EditorState.create({schema,plugins:this.getPlugins()});
        this._editView = new EditorView(document.querySelector(this._containerSelector)!, {
            state:this._editState,
            dispatchTransaction:this.handleTransaction,            
        });
    } 

}