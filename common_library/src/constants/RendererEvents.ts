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
    static logger="logger";
    
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

    static stageItem(){
        const channel = "stageItem";
        const result:IChannelModel={
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        }
        return result;
    };

    static unStageItem(){
        const channel = "unStageItem";
        const result:IChannelModel={
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        }
        return result;
    };

    static stageAll(){
        const channel = "stageAll";
        const result:IChannelModel={
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        }
        return result;
    };

    static unStageAll(){
        const channel = "unStageAll";
        const result:IChannelModel={
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        }
        return result;
    };
    
    static discardItem(){
        const channel = "discardItem";
        const result:IChannelModel={
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        }
        return result;
    };

    static discardAll(){
        const channel = "discardAll";
        const result:IChannelModel={
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        }
        return result;
    };
}