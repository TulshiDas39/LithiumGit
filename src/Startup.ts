import { EnumTheme, IConfigInfo, MainEvents, RendererEvents } from "common_library";
import { app, BrowserWindow, Menu } from "electron";
import { autoUpdater } from "electron-updater";
import * as path from "path";
import { DataManager } from "./businessClasses";
import { FileManager } from "./businessClasses/FileManager";
import { GitManager } from "./businessClasses/GitManager";
import { Updater } from "./businessClasses/Updater";
import { Config } from "./config";
import { AppData } from "./dataClasses/AppData";
import { SavedData } from "./dataClasses/SavedData";
import { DB } from "./db_service/db_service";
import { Env } from "./types";
import { ShellManager } from "./businessClasses/ShellManager";

export class Startup{
    private readonly uiPort = Config.UI_PORT;

    async initilise(){
      //this.initAppData();
      this.addExceptionHandler();
      this.checkForUpdate();
      await this.loadSavedData();      
      this.startIpcManagers();
    }

    checkForUpdate(){
      if(Config.env === Env.DEVELOPMENT)
        return;
      try{
        new Updater().checkForUpdate();
      }catch(e){
        console.log(e?.toString());
      }
    }

    addExceptionHandler(){
      process.on('uncaughtException',  (error) => {
        console.log("inside erro handler.");
        AppData.mainWindow?.webContents.send(RendererEvents.showError().channel,error.message);
      })
    }

    start(){
        
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

    private async loadDatabases(){
      await DB.config.load();
      await DB.repository.load();
      await DB.annotation.load();
      await DB.notification.load();
    }

    private async loadSavedData(){
        await this.loadDatabases();
        await this.loadRecentRepositories();
        await this.loadConfigInfo();
    }

    private async loadRecentRepositories(){                        
        SavedData.data.recentRepositories = await DB.repository.getAll();
    }

    private async loadConfigInfo(){      
      SavedData.data.configInfo = (await DB.config.getAll())[0];
      if(!SavedData.data.configInfo){
        const record={
          theme:EnumTheme.Dark,
        } as IConfigInfo;
        SavedData.data.configInfo= await DB.config.insertAndRemainOneAsync(record);
      }
      if(!SavedData.data.configInfo.theme){
        SavedData.data.configInfo.theme = EnumTheme.Dark;
      }
    }

    private async  createWindow() {
        if(Config.env !== Env.DEVELOPMENT)
          Menu.setApplicationMenu(null);
        const mainWindow = new BrowserWindow({
          height: 600,
          webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation:false,
          },
          width: 800,
          icon: path.join(__dirname, 'icons/256x256.png')
        });
        mainWindow.maximize();
        AppData.mainWindow = mainWindow;
        if(Config.env === Env.DEVELOPMENT)          
          mainWindow.loadURL(`http://localhost:${this.uiPort}`);
        else{
          const htmlFile =   path.resolve(__dirname,"ui", 'index.html');
          mainWindow.loadFile(htmlFile);
        }
        
        if(Config.env === Env.DEVELOPMENT)
          mainWindow.webContents.openDevTools();
    }

    private handleReadyState(){
        // app.on("ready", async () => {
        //     await this.initilise();
        //     await this.createWindow();
          
        //     app.on("activate", function () {
        //       // On macOS it's common to re-create a window in the app when the
        //       // dock icon is clicked and there are no other windows open.
        //       if (BrowserWindow.getAllWindows().length === 0) this.createWindow();
        //     });
        // });

        app.whenReady().then(async ()=>{
          await this.initilise();
          await this.createWindow();
        
          app.on("activate", function () {
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (BrowserWindow.getAllWindows().length === 0) this.createWindow();
          });
        })
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
      new ShellManager().start();
    }

}