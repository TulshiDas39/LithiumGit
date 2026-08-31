import { EnumChangeListViewMode, EnumDiffViewMode, EnumTheme } from "../enums";
import { BaseSchema } from "../schemas";

export interface IConfigInfo extends BaseSchema {
    theme:EnumTheme;
    checkedForUpdateAt:string;
    diffViewMode:EnumDiffViewMode;
    changeListViewMode:EnumChangeListViewMode;
}