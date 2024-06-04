import { app, BrowserWindow } from "electron";
import path = require("path");

export class AppData{
    static appPath:string = app.getAppPath();
    private static homePath = app.getPath('home');
    static dataPath = path.join(AppData.homePath,".lithiumgit");
    static mainWindow:BrowserWindow;
}