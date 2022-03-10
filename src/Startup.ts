import { MainEvents } from "common_library";
import { app, BrowserWindow, ipcRenderer } from "electron";
import * as path from "path";
import { DataManager } from "./businessClasses";
import { FileManager } from "./businessClasses/FileManager";
import { GitManager } from "./businessClasses/GitManager";
import { AppData } from "./dataClasses/AppData";
import { SavedData } from "./dataClasses/SavedData";
import { DB } from "./db_service/db_service";

export class Startup{
    start(){
        this.initAppData();
        this.loadSavedData();
        this.startIpcManagers();
        // this.createWindow();          
          // This method will be called when Electron has finished
          // initialization and is ready to create browser windows.
          // Some APIs can only be used after this event occurs.
        this.handleReadyState();
        this.handleAppFocus();
          
          // Quit when all windows are closed, except on macOS. There, it's common
          // for applications and their menu bar to stay active until the user quits
          // explicitly with Cmd + Q.
        this.handleWindowClosed();
          
          // In this file you can include the rest of your app"s specific main process
          // code. You can also put them in separate files and require them here.
          
    }

    private initAppData(){
        // AppData.appPath = app.getAppPath();
    }

    private loadSavedData(){
        SavedData.recentRepositories = DB.repository.getAll();        
    }

    private createWindow() {
        const mainWindow = new BrowserWindow({
          height: 600,
          webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            // nodeIntegration:true,
            contextIsolation:false,
          },
          width: 800,
        });
        AppData.mainWindow = mainWindow;
        mainWindow.loadURL("http://localhost:54522");      
        mainWindow.webContents.openDevTools();
    }

    private handleReadyState(){
        app.on("ready", () => {
            this.createWindow();
          
            app.on("activate", function () {
              // On macOS it's common to re-create a window in the app when the
              // dock icon is clicked and there are no other windows open.
              if (BrowserWindow.getAllWindows().length === 0) this.createWindow();
            });
        });
    }

    private handleAppFocus(){
      app.on("browser-window-focus", () => {          
          if(AppData.mainWindow?.webContents){            
            AppData.mainWindow.webContents.send(MainEvents.AppFocused);
          }
      });
  }

    private handleWindowClosed(){
        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
              app.quit();
            }
        });
    }

    private startIpcManagers(){
      new DataManager().start();
      new GitManager().start();
      new FileManager().start();
    }

}