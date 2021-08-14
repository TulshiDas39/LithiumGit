"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RendererEvents = void 0;
class RendererEvents {
    static getDirectoryPath() {
        const channel = "getDirectoryPath";
        const result = {
            channel,
            replyChannel: RendererEvents.replyChanelPrefix + channel
        };
        return result;
    }
    ;
}
exports.RendererEvents = RendererEvents;
RendererEvents.replyChanelPrefix = "reply";
RendererEvents.getRecentRepositoires = "getRecentRepositoires";
RendererEvents.updateRepositories = "updateRepositories";
RendererEvents.isValidRepoPath = "isValidRepoPath";
