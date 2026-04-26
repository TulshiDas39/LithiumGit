import { Transaction } from "prosemirror-state";
import { ModalData } from "../../../components/modals/ModalData";
import { ActionModals } from "../../../store";
import { ActionUI } from "../../../store/slices/UiSlice";
import { ReduxUtils } from "../ReduxUtils";
import { TextEditor } from "./TextEditor";
import { DataUtils } from "../DataUtils";

export class PlainTextEditor extends TextEditor{
    hideCrlf(): void {
        ReduxUtils.dispatch(ActionUI.setLinefeedType(undefined));
    }
    hideEncoding(): void {
        ReduxUtils.dispatch(ActionUI.setEncoding(undefined));
    }  
    private _saveBtn:HTMLElement | null = null;  
    constructor(containerSelector:string) {
        super(containerSelector);
        this.saveHandler = success => this.onSave(success);
    }

    private onSave(success:boolean){
        ReduxUtils.dispatch(ActionUI.setSync(undefined));
        if(success){
            this._saveBtn?.classList.add("d-none");
            ModalData.appToast.message = "Saved successfully.";
            ReduxUtils.dispatch(ActionModals.showToast());
        }else{
            ModalData.appToast.message = "Failed to save changes.";
            ReduxUtils.dispatch(ActionModals.showToast());
        }
    }

    protected override handleTransaction(transaction: Transaction) {
        super.handleTransaction(transaction);
        if(transaction.docChanged){
            const savebtn = this.saveBtn();
            if(this.IsDocChanged()){            
                savebtn?.classList.remove("d-none");
            }else{
                savebtn?.classList.add("d-none");
            }
        }
    }

    private saveBtn(){
        if(!this._saveBtn || !this._saveBtn.isConnected){
            this._saveBtn = document.querySelector(`${this._containerSelector}`)?.closest(".diff-view")?.querySelector(".save-btn-container")!;
            this._saveBtn.addEventListener('click',() => {
                ReduxUtils.dispatch(ActionUI.setSync({text:"Saving changes..."}));
                this.save();
            });
        }
        return this._saveBtn;
    }

    async renderLines(filePath:string){
        const r = await this.readFile(filePath);
        if(!r) return false;
        const succeeded = await super.render();
        ReduxUtils.dispatch(ActionUI.setLinefeedType(this._lineFeedType));
        ReduxUtils.dispatch(ActionUI.setEncoding(this._encoding));
        DataUtils.handleLFTypeChangeOfModifiedFile = () => this.switchLfType();
        DataUtils.handleEncodingChangeOfModifiedFile = (encoding) => this.switchEncoding(encoding);
        return succeeded;
    }

}