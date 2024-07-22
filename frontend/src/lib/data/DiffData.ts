import { EnumHtmlIds } from "../enums";
import { ChangeUtils } from "../utils/ChangeUtils";

export class DiffData{
    static readonly changeUtils = new ChangeUtils(EnumHtmlIds.CommitDiff);
    static readonly changeUtilsForCommitList = new ChangeUtils(EnumHtmlIds.CommitDiffFromList);
    static ResolveObjectUtils(containerId:EnumHtmlIds){
        if(containerId === EnumHtmlIds.CommitDiff)
            return DiffData.changeUtils;
        if(containerId === EnumHtmlIds.CommitDiffFromList)
            return DiffData.changeUtilsForCommitList;
        return null;
    }
}