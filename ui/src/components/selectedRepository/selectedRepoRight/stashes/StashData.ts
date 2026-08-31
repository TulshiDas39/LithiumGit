import { EnumHtmlIds } from "../../../../lib";
import { ChangeUtils } from "../../../../lib/utils/ChangeUtils";

const createChangeUtils = ()=>{
    const changeUtils = new ChangeUtils(EnumHtmlIds.StashDiff);
    changeUtils.allowUnifiedView = true;
    return changeUtils;
}

export class StashData{
    static readonly changeUtils = createChangeUtils();
}