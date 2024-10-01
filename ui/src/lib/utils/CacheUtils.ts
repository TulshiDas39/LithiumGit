import { IRepositoryDetails } from "common_library";
import localforage from "localforage";

export enum CacheKey{
    repoDetails="repoDetails_"
}

export class CacheUtils{
    static async setRepoDetails(data:IRepositoryDetails){
        await localforage.setItem(CacheKey.repoDetails+data.repoInfo.path,data);
    }

    static async getRepoDetails(path:string){
        const res = await localforage.getItem<IRepositoryDetails>(CacheKey.repoDetails+path);
        return res;
    }

    static async clearRepoDetails(path:string){
        await localforage.removeItem(CacheKey.repoDetails+path);
    }
}