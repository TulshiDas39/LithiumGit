import { EnumLinefeedType } from "common_library";
import { IpcUtils } from "./IpcUtils";

export class TextEditor {
    private _containerId:string = '';
    private _content?:string = null!;
    private _lines:string[] = [];
    private _lineFeedType:EnumLinefeedType = EnumLinefeedType.LF;
    private _encoding:string = 'utf-8';
    private readonly _systemLineFeedType:EnumLinefeedType = EnumLinefeedType.CRLF;
    constructor(containerId:string){
        this._containerId = containerId; 
        this._systemLineFeedType = IpcUtils.getLineFeedType().result || EnumLinefeedType.CRLF;       
    }

    setContent(content:string){
        this._content = content;
        return this;
    }


    private render(){

    } 

}