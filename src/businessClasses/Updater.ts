import { autoUpdater } from "electron-updater";
import { DB } from "../db_service";
import { INewVersionInfo, RendererEvents } from "common_library";
import { AppData } from "../dataClasses";
import { app, ipcMain } from "electron";

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
            if(!process.platform.startsWith('win') || this.newVersion === app.getVersion())
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

    private sendDownloadLatestVersionNotification(){
      const info:INewVersionInfo={
        version:this.newVersion,
        downloaded:false,        
      };
      const notifiacation = DB.notification.addNotificationForNewUpdate(info);
      if(notifiacation){
        AppData.mainWindow?.webContents.send(RendererEvents.notification,notifiacation);
      }
    }

    private checkForUpdate(){
        // autoUpdater.checkForUpdatesAndNotify({title:"New version of LithiumGit downloaded",body:"LithiumGit will be updated on application exit."});
        return autoUpdater.checkForUpdates().then(r=>{
          this.newVersion = r?.updateInfo?.version;
          if(!process.platform?.toString().startsWith('win') || this.newVersion !== app.getVersion()){
            this.sendDownloadLatestVersionNotification();
          }
        });
    }

   registerIpcEvents(){
      this.handleCheckForUpdate();
      this.handleInstall();
   }

   
   private handleCheckForUpdate(){
    ipcMain.handle(RendererEvents.checkForUpdate, async (_e)=>{
      await this.checkForUpdate();
    })
  }

    private handleInstall(){
      ipcMain.handle(RendererEvents.installUpdate,(_e)=>{
        autoUpdater.quitAndInstall(true,true);
      })
    }
}