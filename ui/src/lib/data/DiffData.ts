import { EnumHtmlIds } from "../enums";
import { ChangeUtils } from "../utils/ChangeUtils";

const createChangeUtils = (containerId:EnumHtmlIds)=>{
    const changeUtils = new ChangeUtils(containerId);
    changeUtils.allowUnifiedView = true;
    return changeUtils;
}

export class DiffData{
    static readonly changeUtils = createChangeUtils(EnumHtmlIds.CommitDiff);
    static readonly changeUtilsForCommitList = createChangeUtils(EnumHtmlIds.CommitDiffFromList);
    static ResolveObjectUtils(containerId:EnumHtmlIds){
        if(containerId === EnumHtmlIds.CommitDiff)
            return DiffData.changeUtils;
        if(containerId === EnumHtmlIds.CommitDiffFromList)
            return DiffData.changeUtilsForCommitList;
        return null;
    }
}