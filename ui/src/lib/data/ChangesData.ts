import { EnumHtmlIds } from "..";
import { ChangeUtils } from "../utils/ChangeUtils";
import { TextEditor } from "../utils/editors";

export class ChangesData{
    static readonly changeUtils = new ChangeUtils(EnumHtmlIds.diffview_container);
    static changeEditor:TextEditor = null!;
}