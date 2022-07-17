import { RepositoryInfo } from "../schemas";
import { IConfigInfo } from "./IConfigInfo";

export interface ISavedData{
    configInfo:IConfigInfo;
    recentRepositories:RepositoryInfo[];
}