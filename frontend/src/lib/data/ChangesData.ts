import { EnumHtmlIds } from "..";
import { ChangeUtils } from "../utils/ChangeUtils";

export class ChangesData{
    static readonly changeUtils = new ChangeUtils(EnumHtmlIds.diffview_container);
}