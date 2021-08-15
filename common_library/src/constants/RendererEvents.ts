interface IChannelModel{
    channel:string;
    replyChannel:string;
}

export class RendererEvents{
    private static replyChanelPrefix = "reply";
    static getRecentRepositoires= "getRecentRepositoires";
    static updateRepositories="updateRepositories";
    static isValidRepoPath="isValidRepoPath";
    static openFileExplorer="openFileExplorer";
    
    static getDirectoryPath(){
        const channel = "getDirectoryPath";
        const result:IChannelModel={
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        }
        return result;
    };
}