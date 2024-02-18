import { IConfigInfo, MainEvents } from "common_library";
import { app, BrowserWindow, Menu } from "electron";
import { autoUpdater } from "electron-updater";
import express = require("express");
import getPort = require("get-port");
import * as path from "path";
import { DataManager } from "./businessClasses";
import { FileManager } from "./businessClasses/FileManager";
import { GitManager } from "./businessClasses/GitManager";
import { Updater } from "./businessClasses/Updater";
import { Config } from "./config";
import { AppData } from "./dataClasses/AppData";
import { SavedData } from "./dataClasses/SavedData";
import { DB } from "./db_service/db_service";

export class Startup{
    private uiPort = 54523;

    async initilise(){
      //this.initAppData();
      this.checkForUpdate();
      await this.loadSavedData();      
      await this.hostFrontend();
      this.startIpcManagers();
    }

    checkForUpdate(){
      if(Config.env === 'development')
        return;
        new Updater().checkForUpdate();


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
          portNumber:54523,
          autoStage:false,
        } as IConfigInfo;
        SavedData.data.configInfo= await DB.config.insertAndRemainOneAsync(record);
      }
    }

    private async setAvailablePort(){        
        
        let portNumber = SavedData.data.configInfo.portNumber || 54523;
        try{          
          let availablePort = await getPort({port:portNumber});

          if(SavedData.data.configInfo.portNumber !== availablePort){
            SavedData.data.configInfo.portNumber = availablePort;
            DB.config.updateOne(SavedData.data.configInfo);
          }
          this.uiPort = availablePort;
          return availablePort;
        }catch(e){
          console.error(e);
          this.uiPort = 54522;
        }
    }

    private async hostFrontend(){
      if(Config.env === 'development'){
        this.uiPort = Config.FRONTEND_PORT;
        return;
      }
      await this.setAvailablePort();
      
      const app = express();

      app.use(express.static(__dirname + '/frontend'));

      app.get('*', function (request, response) {
        response.sendFile(path.resolve(__dirname,"frontend", 'index.html'));
      });

      app.listen(this.uiPort);
       
    }

    private async  createWindow() {
        if(Config.env !== 'development')
          Menu.setApplicationMenu(null);
        const mainWindow = new BrowserWindow({
          height: 600,
          webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation:false,
          },
          width: 800,
        });
        mainWindow.maximize();
        AppData.mainWindow = mainWindow;
        mainWindow.loadURL(`http://localhost:${this.uiPort}`);
        
        if(Config.env === 'development')
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
    }

}