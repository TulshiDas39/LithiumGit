import { autoUpdater } from "electron-updater";
import { DB } from "../db_service";
import { INewVersionInfo, RendererEvents } from "common_library";
import { AppData } from "../dataClasses";
import { app, ipcMain } from "electron";
import { AppUtility } from "./AppUtility";
import { EnumPlatform, ILatestVersion } from "../types";
import { Intercept } from "./Interceptor";

export class Updater{
    private newVersion:string="";

    constructor(){
      autoUpdater.autoInstallOnAppQuit = false;
      this.handleEvents();
    }

    sendStatusToWindow(text:string) {
        // log.info(text);
        // win.webContents.send('message', text);
    }

    handleEvents(){
        autoUpdater.on('checking-for-update', () => {
            this.sendStatusToWindow('Checking for update...');
          })
          autoUpdater.on('update-available', (info) => {
            this.sendStatusToWindow('Update available.');
          })
          autoUpdater.on('update-not-available', (info) => {
            this.sendStatusToWindow('Update not available.');
          })
          autoUpdater.on('error', (err) => {
            this.sendStatusToWindow('Error in auto-updater. ' + err);
          })
          autoUpdater.on('download-progress', (progressObj) => {
            let log_message = "Download speed: " + progressObj.bytesPerSecond;
            log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
            log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
            this.sendStatusToWindow(log_message);
          })
          autoUpdater.on('update-downloaded', async (_) => {
            if(AppUtility.getPlatform() !== EnumPlatform.WINDOWS || this.newVersion === app.getVersion())
              return;
            const info:INewVersionInfo={
              version:this.newVersion,
              downloaded:true,
            };
            const notifiacation = await DB.notification.addNotificationForNewUpdate(info);
            if(notifiacation){
              AppData.mainWindow?.webContents.send(RendererEvents.notification,notifiacation);
            }
          });
    }

    private async sendDownloadLatestVersionNotification(){
      const info:INewVersionInfo={
        version:this.newVersion,
        downloaded:false,        
      };
      const notifiacation = await DB.notification.addNotificationForNewUpdate(info);
      if(notifiacation){
        AppData.mainWindow?.webContents.send(RendererEvents.notification,notifiacation);
      }
    }

    private async checkForUpdateManually(){
      try{
        const url = "https://github.com/LithiumGit/LithiumGit/releases/download/v1.0.0/latest.json";
        const res = await Intercept.get(url,{responseType:'json'});
        if(res.error)
          return ;
        const data:ILatestVersion = res.response.data;
        this.newVersion = data.version;
        console.log("latest version:"+data.version);
        if(data.version !== app.getVersion()){
          console.log("Sending notification to download latest version.");
          await this.sendDownloadLatestVersionNotification();
        }
        console.log("response:");
        console.log(res.response.data);
      }catch(e){}
    }

    private checkForUpdate(){
        // autoUpdater.checkForUpdatesAndNotify({title:"New version of LithiumGit downloaded",body:"LithiumGit will be updated on application exit."});
        return autoUpdater.checkForUpdates().then(r=>{
          this.newVersion = r?.updateInfo?.version;          
        });
    }

   registerIpcEvents(){
      this.handleCheckForUpdate();
      this.handleInstall();
   }

   
   private handleCheckForUpdate(){
    ipcMain.handle(RendererEvents.checkForUpdate, async (_e)=>{
      if(AppUtility.getPlatform() === EnumPlatform.WINDOWS){
        await this.checkForUpdate();
      }else{
        await this.checkForUpdateManually();
      }
    })
  }

    private handleInstall(){
      ipcMain.handle(RendererEvents.installUpdate,(_e)=>{
        autoUpdater.quitAndInstall(true,true);
      })
    }
}