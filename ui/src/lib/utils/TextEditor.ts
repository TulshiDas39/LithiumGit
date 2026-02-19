import { EnumLinefeed } from "common_library";
import { IpcUtils } from "./IpcUtils";
import { Data } from "../data";
import { ILine } from "../interfaces";
import {schema} from "prosemirror-schema-basic"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"

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


    private render(){
        this._editState = EditorState.create({schema})
        this._editView = new EditorView(document.querySelector(this._containerSelector)!, {state:this._editState});
    } 

}