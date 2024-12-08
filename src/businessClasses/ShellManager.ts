import { RendererEvents } from "common_library";
import { ipcMain ,shell} from "electron";


export class ShellManager{
    start(){
        this.addEventHandlers();
    }

    private addEventHandlers(){
        this.addOpenLinkHandler();
    }

    private addOpenLinkHandler(){
        ipcMain.handle(RendererEvents.openLink, async (e,url:string)=>{
            shell.openExternal(url);
        })
    }
}