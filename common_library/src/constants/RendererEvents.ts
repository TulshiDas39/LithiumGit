interface IChannelModel{
    channel:string;
    replyChannel:string;
}

export class RendererEvents{
    private static replyChanelPrefix = "reply_";
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
    }

    static getRepositoryDetails(){
        const channel = "getRepositoryDetails";
        const result:IChannelModel={
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        }
        return result;
    };

    static getStatus(){
        const channel = "getStatus";
        const result:IChannelModel={
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        }
        return result;
    };
}