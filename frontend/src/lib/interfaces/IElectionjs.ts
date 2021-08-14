export interface IpcRenderer{
    sendSync(channel: string, ...args: any[]): any;
}