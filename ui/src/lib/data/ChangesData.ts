import { EnumHtmlIds } from "..";
import { ChangeUtils } from "../utils/ChangeUtils";
import type { ConflictEditor } from "../utils/editors/ConflictEditor";
import { TextEditor } from "../utils/editors";

const createChangeUtils = ()=>{
    const changeUtils = new ChangeUtils(EnumHtmlIds.diffview_container);
    changeUtils.allowUnifiedView = true;
    return changeUtils;
}

export class ChangesData{
    static readonly changeUtils = createChangeUtils();
    static changeEditor:TextEditor = null!;
    static stagedEditor:TextEditor = null!;
    static conflictEditor?:ConflictEditor;
}