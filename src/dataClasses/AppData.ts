import { Constants, EnumLinefeed } from "common_library/lib";
import { app, BrowserWindow } from "electron";
import path = require("path");
import { EOL } from 'os';
import { FileManager } from "../businessClasses/FileManager";

export class AppData{
    static appPath = '';
    private static homePath = '';
    static dataPath = '';
    static tempPath = '';
    static mainWindow:BrowserWindow;
    static systemLineFeedType:EnumLinefeed = null!;
    static encodingList:string[] = [];
    static isGitInstalled = false;

    static initialize() {
        AppData.appPath = app.getAppPath();
        AppData.homePath = app.getPath('home');
        AppData.dataPath = path.join(AppData.homePath, ".lithiumgit");
        AppData.tempPath = path.join(AppData.dataPath, Constants.tempFolder);
        AppData.systemLineFeedType = EOL as EnumLinefeed;
        AppData.encodingList = new FileManager().getEncodingList();
    }
}