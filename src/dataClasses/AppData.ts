import { app } from "electron";

export class AppData{
    static appPath:string = app.getAppPath();
}