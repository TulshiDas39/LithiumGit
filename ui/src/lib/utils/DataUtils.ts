// import { FetchState } from "../../store";

import { EnumLinefeed } from "common_library";
import { FetchState } from "../enums";

export class DataUtils{
    static clone = {
        progress:0,
        stage:FetchState.Remote,
        timer: undefined! as NodeJS.Timeout,
    }
    static handleLFTypeChangeOfModifiedFile = ()=>{};    
    static handleEncodingChangeOfModifiedFile = (encoding:string)=>{};    
}