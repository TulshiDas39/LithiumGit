import { ITypedConfig } from "./ITypedConfig";
import { IUserConfig } from "./IUserConfig";

export interface IGitConfig{
    user:ITypedConfig<IUserConfig>;
}