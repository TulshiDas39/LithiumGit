interface IChannelModel {
    channel: string;
    replyChannel: string;
}
export declare class RendererEvents {
    private static replyChanelPrefix;
    static getRecentRepositoires: string;
    static updateRepositories: string;
    static isValidRepoPath: string;
    static openFileExplorer: string;
    static getDirectoryPath(): IChannelModel;
}
export {};
