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

    static getStatusSync(){
        const channel = "getStatusSync";
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

    static getFileContent(){
        const channel = "getFileContent";
        const result:IChannelModel={
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        }
        return result;
    };

    static diff(){
        const channel = "diff";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel;        
    }

    static checkoutCommit(){
        const channel = "checkoutCommit";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static refreshBranchPanel(){
        const channel = "refreshBranchPanel";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static createBranch(){
        const channel = "createBranch";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static showError(){
        const channel = "showError";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static pull(){
        const channel = "pull";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static push(){
        const channel = "push";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static fetch(){
        const channel = "fetch";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static fetchAll(){
        const channel = "fetchAll";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static joinPath(){
        const channel = "joinPath";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static commit(){
        const channel = "commit";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static updateAutoStaging(){
        const channel = "updateAutoStaging";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static getSaveData(){
        const channel = "getSaveData";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static gitShow(){
        const channel = "gitShow";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static gitMerge(){
        const channel = "gitMerge";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static gitClean(){
        const channel = "gitClean";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static gitAddRemote(){
        const channel = "gitAddRemote";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static gitGetRemoteList(){
        const channel = "getRemoteList";
        return {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix+channel
        } as IChannelModel; 
    }

    static readonly gitRemoveRemote = "gitRemoveRemote";
    static readonly gitLog = "gitLog";
}

