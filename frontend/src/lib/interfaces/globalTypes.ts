import { IpcRenderer } from ".";

export interface T{

}

declare global {
  interface Window {
      ipcRenderer:IpcRenderer
  }
}