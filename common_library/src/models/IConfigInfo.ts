import { EnumTheme } from "../enums";
import { BaseSchema } from "../schemas";

export interface IConfigInfo extends BaseSchema {    
    theme:EnumTheme;
    checkedForUpdateAt:string;
}