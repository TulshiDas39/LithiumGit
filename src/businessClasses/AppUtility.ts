import { EnumPlatform } from "../types";

export class AppUtility{
    static getPlatform(){
        const platform = process.platform?.toLowerCase();
        if(platform?.startsWith('win'))
            return EnumPlatform.WINDOWS;
        if(platform?.startsWith('mac'))
            return EnumPlatform.MAC;
        
        return EnumPlatform.LINUX;        
    }
}