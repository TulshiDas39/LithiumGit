import { IStatus } from "common_library";
import { ILoaderInfo } from "../../store/slices/UiSlice";

export class ReduxUtils{
    static setStatus=(status:IStatus)=>{};
    static setLoader=(payload:ILoaderInfo|undefined)=>{};
    static dispatch:any = null;
    static refreshGraph=() => {};
}