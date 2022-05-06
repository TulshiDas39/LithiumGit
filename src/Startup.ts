import { MainEvents } from "common_library";
import { app, BrowserWindow, ipcMain, ipcRenderer } from "electron";
import express = require("express");
import getPort = require("get-port");
import * as path from "path";
import { DataManager } from "./businessClasses";
import { FileManager } from "./businessClasses/FileManager";
import { GitManager } from "./businessClasses/GitManager";
import { ConfigInfo } from "./dataClasses";
import { AppData } from "./dataClasses/AppData";
import { SavedData } from "./dataClasses/SavedData";
import { DB } from "./db_service/db_service";

export class Startup{
    private uiPort = 54523;

    async initilise(){
      //this.initAppData();
      await this.loadSavedData();      
      await this.hostFrontend();
      this.startIpcManagers();
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

    private async loadSavedData(){
        SavedData.recentRepositories = DB.repository.getAll();        
        SavedData.configInfo = DB.config.getAll()[0];
        if(!SavedData.configInfo){
          const record={
            portNumber:54523
          } as ConfigInfo;
          await DB.config.insertOneAsync(record);
          SavedData.configInfo = DB.config.getAll()[0];;
        }
    }

    private async setAvailablePort(){        
        console.log("process.NODE_ENV",(process as any).NODE_ENV)
        console.log("process.FRONTEND_PORT",(process as any).FRONTEND_PORT)
        console.log("process.env.FRONTEND_PORT",process.env.FRONTEND_PORT)
        // console.log("process.env",process.env)
        //console.log("process",process)
        // if(process.env.NODE_ENV === 'development')
        //   return process.env.FRONTEND_PORT!;
        let portNumber = SavedData.configInfo.portNumber || 54523;
        try{          
          let availablePort = await getPort({port:portNumber});

          if(SavedData.configInfo.portNumber !== availablePort){
            SavedData.configInfo.portNumber = availablePort;
            DB.config.updateOne(SavedData.configInfo);
          }
          this.uiPort = availablePort;
          return availablePort;
        }catch(e){
          console.error(e);
          this.uiPort = 54522;
        }
    }

    private async hostFrontend(){
      await this.setAvailablePort();
      
      //const port = process.env.PORT || 8080;
      const app = express();

      // serve static assets normally
      app.use(express.static(__dirname + '/build'));

      // handle every other route with index.html, which will contain
      // a script tag to your application's JavaScript file(s).
      app.get('*', function (request, response) {
        response.sendFile(path.resolve(__dirname,"build", 'index.html'));
      });

      app.listen(this.uiPort);
      console.log("server started on port " + this.uiPort);
       
    }

    private async  createWindow() {
        const mainWindow = new BrowserWindow({
          height: 600,
          webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation:false,
          },
          width: 800,
        });
        AppData.mainWindow = mainWindow;
        mainWindow.loadURL(`http://localhost:${this.uiPort}`);

        // mainWindow.loadURL(`http://localhost:54533`);//54533
        mainWindow.webContents.openDevTools();
    }

    private handleReadyState(){
        app.on("ready", async () => {
            await this.initilise();
            await this.createWindow();
          
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