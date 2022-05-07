import { autoUpdater } from "electron-updater";

export class Updater{

    sendStatusToWindow(text:string) {
        // log.info(text);
        // win.webContents.send('message', text);
        console.log(text);
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
          autoUpdater.on('update-downloaded', (info) => {
            this.sendStatusToWindow('Update downloaded');
          });
    }
    checkForUpdate(){
        this.handleEvents();
        autoUpdater.checkForUpdatesAndNotify();
    }

}