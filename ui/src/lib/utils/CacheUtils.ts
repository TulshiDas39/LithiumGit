import { IRepositoryDetails } from "common_library";
import localforage from "localforage";

export enum CacheKey{
    repoDetails="repoDetails_"
}

export class CacheUtils{
    static async setRepoDetails(data:IRepositoryDetails){
        try {
            await localforage.setItem(CacheKey.repoDetails+data.repoInfo.path,data);
        } catch (error) {
        }
    }

    static async getRepoDetails(path:string){
        try{
            const res = await localforage.getItem<IRepositoryDetails>(CacheKey.repoDetails+path);
            return res;
        }catch(e){
            return null!;
        }
        
    }

    static async clearRepoDetails(path:string){
        await localforage.removeItem(CacheKey.repoDetails+path);
    }
}