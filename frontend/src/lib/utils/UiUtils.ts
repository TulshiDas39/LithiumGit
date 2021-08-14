export class UiUtils{
    static removeIpcListeners(channels:string[]){
        channels.forEach(channel=>{
            window.ipcRenderer.removeAllListeners(channel);
        })
    }
}