import { autoUpdater } from "electron-updater";
import { DB } from "../db_service";
import { createNotificationForNewUpdate, RendererEvents } from "common_library";
import { AppData } from "../dataClasses";

export class Updater{
    private newVersion:string="";

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
            const notifiacation = await DB.notification.addNotificationForNewUpdate(this.newVersion);
            if(notifiacation){
              AppData.mainWindow.webContents.send(RendererEvents.notification,notifiacation);
            }
          });
    }
    checkForUpdate(){
        this.handleEvents();
        // autoUpdater.checkForUpdatesAndNotify({title:"New version of LithiumGit downloaded",body:"LithiumGit will be updated on application exit."});
        autoUpdater.autoInstallOnAppQuit = false;
        autoUpdater.checkForUpdates().then(r=>{
          this.newVersion = r?.updateInfo?.version;
        });

    }

}