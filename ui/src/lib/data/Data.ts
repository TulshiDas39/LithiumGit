import { Annotation, EnumLinefeed, IAppData } from "common_library";

export class Data{
    static annotations:Annotation[] = [];
    static get newChangesInLatestVersion(){
        return ["Built-in editor to view changes of files.",
                "Chunk by chunk stage/unstage of changes.",
                "Enhanced conflict resolution with built-in editor.",
                "Performance improvements",
                "Enhanced user interface for better user experience.",
                "Bug fixes and stability improvements."                
            ];
    }

    static systemLineFeedType:EnumLinefeed = EnumLinefeed.CRLF;
    static appData:IAppData = null!;
}