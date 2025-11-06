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
    static readonly removeRecentRepo = "removeRecentRepo";
    static readonly rebase = "rebase";
    static readonly cherry_pick = "cherry_pick";
    static readonly updateRepository = "updateRepository";
    static readonly diffTree = "diffTree";
    static readonly gitRaw = "gitRaw";
    static readonly reset = "reset";
    static readonly deleteBranch = "deleteBranch";
    static readonly cloneRepository = "cloneRepository";
    static readonly cloneProgress = "cloneProgress";
    static readonly isValidPath = "isValidPath";
    static readonly createNewRepo = "createNewRepo";
    static readonly ResolveConflict = "resolveConflict";
    static readonly lastUpdatedDate = "lastUpdatedDate";
    static readonly joinPathAsync = "joinPathAsync";
    static readonly stashes = "stashes";
    static readonly stash = "stash";    
    static readonly annotations = "annotations";    
    static readonly addAnnotation = "addAnnotation";
    static readonly getUserConfig = "getUserConfig";
    static readonly updateUserName = "updateUserName";
    static readonly updateUserEmail = "updateUserEmail";
    static readonly getGraphCommits = "getGraphCommits";
    static readonly continueRebase = "continueRebase";
    static readonly remote = "remote";
    static readonly updateConfig = "updateConfig";
    static readonly openLink = "openLink";
    static readonly removeAnnotation = "removeAnnotation";
    static readonly notification = "newNotification";
    static readonly loadNotifications = "loadNotifications";
    static readonly clearNotifications = "clearNotifications";
    static readonly deleteNotifcations = "deleteNotifcations";
    static readonly updateNotifications = "updateNotifications";
    static readonly checkForUpdate = "checkForUpdate";
    static readonly installUpdate = "installUpdate";
    static readonly ignoreItem = "ignoreItem";
    static readonly deleteFromGit = "deleteFromGit";    
    static readonly getAppInfo = "getAppInfo";
    static readonly setCheckForUpdateTime = "setCheckForUpdateTime";
    static readonly getCommitDetails = "getCommitDetails";    
    static readonly apply = "apply";    
    static readonly showSaveAsDialog = "showSaveAsDialog";
    static readonly writeToFile = "writeToFile";    
    static readonly isBinary = "isBinary";    
}

