import { EnumHtmlIds } from "..";
import { ChangeUtils } from "../utils/ChangeUtils";
import type { ConflictResolutionEditor } from "../utils/editors/ConflictResolutionEditor";
import { TextEditor } from "../utils/editors";

export class ChangesData{
    static readonly changeUtils = new ChangeUtils(EnumHtmlIds.diffview_container);
    static changeEditor:TextEditor = null!;
    static stagedEditor:TextEditor = null!;
    static conflictEditor?:ConflictResolutionEditor;
}