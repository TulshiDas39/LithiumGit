// import { IpcRenderer } from ".";
import {IpcRenderer} from 'electron';

export interface T{

}

declare global {
  interface Window {
      ipcRenderer:IpcRenderer,      
  }
  namespace JSX {
      export type Element = import('react/jsx-runtime').JSX.Element;      
  }  
}
