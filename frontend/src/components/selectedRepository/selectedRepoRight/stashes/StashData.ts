import { EnumHtmlIds } from "../../../../lib";
import { ChangeUtils } from "../../../../lib/utils/ChangeUtils";

export class StashData{
    static readonly changeUtils = new ChangeUtils(EnumHtmlIds.StashDiff);
}