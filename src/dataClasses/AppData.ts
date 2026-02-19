import { EnumLinefeed } from "common_library/lib";
import { app, BrowserWindow } from "electron";
import path = require("path");
import { EOL } from 'os';

export class AppData{
    static appPath:string = app.getAppPath();
    private static homePath = app.getPath('home');
    static dataPath = path.join(AppData.homePath,".lithiumgit");
    static mainWindow:BrowserWindow;
    static systemLineFeedType:EnumLinefeed = EOL as EnumLinefeed;
}