import ReactDOMServer from "react-dom/server";
import { EditorColors } from "../editor";
import { ILine } from "../interfaces";
import { DiffUtils } from "./DiffUtils";
import { DeltaStatic,Quill} from "quill";
import { Difference2 } from "../../components/selectedRepository/selectedRepoRight/changes/Difference2";
import { BranchGraphUtils } from "./BranchGraphUtils";
import { BranchUtils } from "./BranchUtils";

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
        const container = document.getElementById(`${ChangeUtils.containerId}`)!;

        const innerHtml = ReactDOMServer.renderToStaticMarkup(Difference2({
            linesAfterChange:ChangeUtils.currentLines,
            linesBeforeChange:ChangeUtils.previousLines
        }));
        container.innerHTML = innerHtml;        
    }
}