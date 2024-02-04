import { EditorColors } from "../editor";
import { ILine } from "../interfaces";
import { DiffUtils } from "./DiffUtils";
import { DeltaStatic,Quill} from "quill";

export class ChangeUtils{
    static containerId = "";
    static currentLines:ILine[];
    static previousLines:ILine[];
    static previousLineMaxWidth = 300;

    private static currentDelta:DeltaStatic;
    private static currentLineDelta:DeltaStatic;

    private static previousDelta:DeltaStatic;
    private static previousLineDelta:DeltaStatic;


    static init(){
        var quill = new Quill('#editor', {
            theme: 'snow'
          });
    }

    static showChanges(){
        if(ChangeUtils.previousLines){
            ChangeUtils.previousDelta = DiffUtils.getDeltaFromLineConfig(ChangeUtils.previousLines,EditorColors.line.previous,ChangeUtils.previousLineMaxWidth);
            ChangeUtils.previousLineDelta = DiffUtils.getDeltaForLineNumber(ChangeUtils.previousLines);
        }

        if(ChangeUtils.currentLines){
            ChangeUtils.currentDelta = DiffUtils.getDeltaFromLineConfig(ChangeUtils.previousLines,EditorColors.line.previous,ChangeUtils.previousLineMaxWidth);
            ChangeUtils.currentLineDelta = DiffUtils.getDeltaForLineNumber(ChangeUtils.previousLines);
        }
        
    }
}