import { EnumHtmlIds } from "../enums";
import { ChangeUtils } from "../utils/ChangeUtils";

export class DiffData{
    static readonly changeUtils = new ChangeUtils(EnumHtmlIds.CommitDiff);
}