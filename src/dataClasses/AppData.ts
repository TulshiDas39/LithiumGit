import { app, BrowserWindow } from "electron";

export class AppData{
    static appPath:string = app.getAppPath();
    static mainWindow:BrowserWindow;
}