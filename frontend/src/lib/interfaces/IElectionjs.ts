export interface IpcRenderer{
    sendSync(channel: string, ...args: any[]): any;
    send(channel: string, ...args: any[]): void;
}