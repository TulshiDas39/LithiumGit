export interface IpcRenderer{
    sendSync(channel: string, ...args: any[]): any;
    send(channel: string, ...args: any[]): void;
    on(channel: string, listener: (event: any, ...args: any[]) => void): this;
}
