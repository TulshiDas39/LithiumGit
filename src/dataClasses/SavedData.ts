import { RepositoryInfo } from "common_library";
import { ConfigInfo } from "./ConfigInfo";

export class SavedData{
    static recentRepositories:RepositoryInfo[]=[];
    static configInfo:ConfigInfo = undefined!;
}