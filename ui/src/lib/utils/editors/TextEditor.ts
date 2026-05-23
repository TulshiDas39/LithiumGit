import { EnumLinefeed, IChange, StringUtils } from "common_library";
import { Data } from "../../data";
import {Schema, Node, Slice, Fragment} from "prosemirror-model"
import {EditorState, Transaction, Command, PluginKey, Plugin} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {undo, redo, history, undoDepth} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {baseKeymap} from "prosemirror-commands"
import { ReplaceStep } from "prosemirror-transform";
import { IpcUtils } from "../IpcUtils";
import { ModalData } from "../../../components/modals/ModalData";
import { ReduxUtils } from "../ReduxUtils";
import { ActionModals } from "../../../store";
import { EnumModals } from "../../enums";

type EncodingEntry = { encoding: string; prevEncoding:string; depthAfter: number; };

const encodingStackKey = new PluginKey<EncodingEntry[]>('encodingStack');




enum TransMetadata{
    LineFeedType = "lineFeedType",
    Encoding = "encoding",
}


export abstract class TextEditor {
    protected _containerSelector:string = '';    
    protected _lines:string[] = [];
    protected _lineFeedType:EnumLinefeed = EnumLinefeed.LF;
    protected _encoding:string = 'utf-8';
    protected _editState:EditorState = null!;
    protected _editView:EditorView = null!;
    private _schema:Schema= null!;
    private _initialDoc: Node = null!;
    protected _untrackedChanges: IChange[] = [];
    private _trackingChanges = false;
    protected _tempFilePath = '';
    protected _sourceFilePath = '';
    protected saveHandler: ((success:boolean) => void) | null = null;
    protected onSync: (() => void) | null = null;
    private onSyncWaitingCalls: (() => void)[] = [];
    protected lineCount = 0;

    private _encodingChanged?:{from:string;to:string;};
    private _encodingRedoStack: Array<{ encoding: string; depthAtRevert: number }> = [];
    private _isHistoryAction = false;
    private _isRedoingEncoding = false;
    private readonly _encodingChangeStack:EncodingEntry[]=[];
    private readonly _encodingUndoStack:EncodingEntry[]=[];
    private _lastUpdated: string = '';

    constructor(containerSelector:string){
        this._containerSelector = containerSelector; 
        this._lineFeedType = Data.systemLineFeedType;    
        this._schema = this.getSchema();   
    }

    get lasteUpdated(){
        return this._lastUpdated;
    }

    private createDocument(){
        const paragraphs:Node[] =  [];
        for(let line of this._lines){
            const p = this._schema.node('paragraph', null, line? [this._schema.text(line)]:[]);
            paragraphs.push(p);
        }
        const doc = this._schema.node('doc', null, paragraphs);
        return doc;
    }

    protected handleTransaction (transaction: Transaction){             
        let newState = this._editView.state.apply(transaction);
        this._editView.updateState(newState);        
        if(transaction.docChanged){         
            if(newState.doc.childCount !== this.lineCount){
                this.adjustLineNumbers(newState.doc.childCount);
            }
            this.populateChanges(transaction);
        }
    }

    private adjustLineNumbers(newLineCount: number){
        const lineNumbers = this.getLineNumberContainer();
        while(newLineCount > this.lineCount){
            this.lineCount++;
            const p = document.createElement('p');
            p.textContent = `${this.lineCount}`;
            lineNumbers?.appendChild(p);
        }

        while(newLineCount < this.lineCount){
            this.lineCount--;
            lineNumbers?.lastChild?.remove();
        }
        
    }

    private populateChanges(transaction: Transaction){
        if(this._encodingChanged){
            this._untrackedChanges.push({
                text: this.getTextContent(),
                replaceAll: true,
            } as IChange);
            this._encodingChanged = null!;
            this.trackChanges();
            return;
        }
        for (let i = 0; i < transaction.steps.length; i++) {
            const step = transaction.steps[i];
            if (!(step instanceof ReplaceStep)) continue;

            const insertedText = step.slice.content.textBetween(0, step.slice.content.size, this._lineFeedType);

            const $posFrom = transaction.docs[i].resolve(step.from);
            const $posTo = transaction.docs[i].resolve(step.to);
            const lineIndexFrom = $posFrom.index(0);
            const lineIndexTo = $posTo.index(0);
            const parentOffsetFrom = $posFrom.parentOffset;
            const parentOffsetTo = $posTo.parentOffset;

            const change:IChange = {
                startlineIndex: lineIndexFrom,
                startOffset: parentOffsetFrom,
                endlineIndex: lineIndexTo,
                endOffset: parentOffsetTo,
                text: insertedText,
            };
            this._untrackedChanges.push(change);            
        }
        this.trackChanges();
    }

    private trackChanges(){
        if(this._trackingChanges || this._untrackedChanges.length === 0)
            return;

        this._trackingChanges = true;
        const perform = ()=>{
            const itemCount = this._untrackedChanges.length;
            IpcUtils.trackFileChanges(this._tempFilePath, this._untrackedChanges,this._encoding).then((result)=>{
                if(result.error){
                    console.error("Error tracking changes:", result.error);
                    this._trackingChanges = false;
                }
                else if(result.result !== itemCount){
                    console.warn(`Mismatch in tracked changes count. Expected: ${itemCount}, Tracked: ${result.result}`);
                    this._untrackedChanges.splice(0,result.result);
                    this._trackingChanges = false;
                }
                else{
                    this._untrackedChanges.splice(0,itemCount);
                    if(this._untrackedChanges.length) {
                        perform();
                    }
                    else {
                        this._trackingChanges = false;
                        this.onSyncWaitingCalls.forEach(call => call());
                        this.onSyncWaitingCalls = [];
                        this.onSync?.();
                    }
                }
            });
        }
        

        perform();

    }

    protected getLineNumberContainer(){
        const currentPanel = document.querySelector(this._containerSelector)?.closest(".current");
        return currentPanel?.querySelector(".line_numbers") as HTMLElement | null;
    }

    protected renderLineNumbers(){
        const lineNumbers = this.getLineNumberContainer();
        if(!lineNumbers) return;
        //TODO: use fit-content for width and set the width of lineNumbers container to fit the line numbers, this way we can avoid setting a fixed width and also avoid the issue of line numbers getting cut off when there are more lines
        lineNumbers.style.width = `${String(this.lineCount).length + 2}ch`;
        //TODO: optimize this by only adding/removing the required line numbers instead of re-rendering all of them
        lineNumbers.innerHTML = Array.from({length: this.lineCount}, (_, i) => `<p>${i + 1}</p>`).join("");        
    }

    private readonly insertTab: Command = (state, dispatch) => {
        dispatch?.(state.tr.insertText("\t"));
        return true;
    };

    private readonly triggerSave: Command = (state, dispatch) => {
        this.save();
        return true;
    };

    private readonly undoOrRevertEncoding: Command = (state, dispatch) => {        
        const depth = undoDepth(state) as number;
        console.log("Undo depth before undo command:", depth);

        if(this._encodingChangeStack.length){
            const top = this._encodingChangeStack[this._encodingChangeStack.length - 1];
            console.log("Undo depth before undo command:", depth);
            console.log("top depth:", top.depthAfter);
            
            if(depth <= top.depthAfter){
                console.log("Reverting encoding change:", top.encoding, "->", top.prevEncoding);
                this._encodingChanged = {from:top.encoding,to:top.prevEncoding};
                this._encodingUndoStack.push(this._encodingChangeStack.pop()!);
                this._encoding = top.prevEncoding;
                this.displayEncoding();
            }
        }
        return undo(state, dispatch);
    };

    private readonly redoOrReapplyEncoding: Command = (state, dispatch) => {
        return redo(state, dispatch);
    };


    protected getPlugins(){
        return [history(),
            keymap({
                "Mod-z": this.undoOrRevertEncoding,
                "Mod-y": this.redoOrReapplyEncoding,              
                "Tab": this.insertTab,
                "Mod-s": this.triggerSave,
            }),
            keymap(baseKeymap),
        ];
    }


    protected getSchema(){
        return new Schema({
            nodes: {
                doc: { content: "paragraph+" },
                paragraph: {
                    content: "text*",
                    whitespace: "pre",
                    toDOM: () => ["div", { style: "white-space: pre" }, 0] as any,
                    parseDOM: [{ tag: "div" }],
                },
                text: { inline: true },
            }
        });
    }

    private handlePaste(view: EditorView, event: ClipboardEvent) {
        const text = event.clipboardData?.getData('text/plain');
        if (!text) return false;
        const lines = text.split(/\r?\n/);
        const { state } = view;
        const { schema } = state;
        const nodes = lines.map(line =>
            schema.node('paragraph', null, line ? [schema.text(line)] : [])
        );
        const slice = new Slice(Fragment.from(nodes), 1, 1);
        view.dispatch(state.tr.replaceSelection(slice));
        return true;
    }

    protected IsDocChanged(){
        return !this._editView.state.doc.eq(this._initialDoc);
    }

    protected async switchLfType(){        
        if(this.IsDocChanged()){
            ModalData.errorModal.message = "Please save your changes before switching line feed type.";
            ReduxUtils.dispatch(ActionModals.showModal(EnumModals.ERROR));
            return;
        }
        this._lineFeedType = this._lineFeedType === EnumLinefeed.CRLF ? EnumLinefeed.LF : EnumLinefeed.CRLF;
        await IpcUtils.reWriteFile(this._tempFilePath, this._lineFeedType,this._encoding);
        await this.save();
        await this.reRender();
    }    

    protected async switchEncoding(encoding:string){
        if(this.IsDocChanged()){
            ModalData.errorModal.message = "Please save your changes before switching encoding.";
            ReduxUtils.dispatch(ActionModals.showModal(EnumModals.ERROR));
            return;
        }
        // await IpcUtils.reWriteFile(this._tempFilePath, this._lineFeedType,encoding);
        const prevEncoding = this._encoding;
        this._encoding = encoding;
        await this.refresh();

        const depth = undoDepth(this._editView.state) as number;
        this._encodingChangeStack.push({ encoding: encoding, prevEncoding, depthAfter: depth });
        this._encoding = encoding;
    }

    getContentLines(): string[] {
        const lines: string[] = [];
        this._editView.state.doc.forEach(node => lines.push(node.textContent ?? ''));
        return lines;
    }

    private setContent(textContent: string): void {
        const lines = textContent.split(/\r?\n/);
        this.setContentFromLines(lines);
    }

    private setContentFromLines(lines: string[]): void {
        const { schema } = this._editView.state;
        const nodes = lines.map(line =>
            schema.node('paragraph', null, line ? [schema.text(line)] : [])
        );
        const newDoc = schema.node('doc', null, nodes);
        const { state } = this._editView;
        const tr = state.tr.replaceWith(0, state.doc.content.size, newDoc.content);
        this._editView.dispatch(tr);
    }

    protected async readFile(){
        const r = await IpcUtils.getFileContentRaw(this._tempFilePath, this._encoding);
        if(r.error){
            console.error("Error reading file content:", r.error);
            return false;
        }
        const parts = r.result?.split(/(\r\n|\r|\n)/) || [];
        let lfCount = 0;
        let crlfCount = 0;
        const lines:string[] = [];
        for(let i=0;i<parts.length;i=i+2){
            lines.push(parts[i]);
            if(parts[i+1] === "\r\n"){
                crlfCount++;
            }else if(parts[i+1] === "\n"){
                lfCount++;
            }
        }
        if(!!lfCount || !!crlfCount){
            this._lineFeedType = crlfCount > lfCount ? EnumLinefeed.CRLF : EnumLinefeed.LF;
        }
        this._lines = lines;

        return true;
    }

    private async detectEncoding(){
        const encodingRes = await IpcUtils.detectEncoding(this._tempFilePath);
        console.log("Detected encoding:", encodingRes.result);
        if(!encodingRes.error){
            this._encoding = encodingRes.result!;
        }
    }     

    protected async render(filePath:string){
        this._editView?.destroy();
        this._sourceFilePath = filePath;
        const success = await this.createTempFile();
        await this.detectEncoding();
        const readSuccess = await this.readFile();
        if(!readSuccess) return false;
        this._lastUpdated = new Date().toISOString();
        const doc = this.createDocument();        
        this._editState = EditorState.create({schema:this._schema, doc, plugins:this.getPlugins()});
        this._editView = new EditorView(document.querySelector(this._containerSelector)!, {
            state:this._editState,
            dispatchTransaction:(tr) => this.handleTransaction(tr),
            attributes: { spellcheck: "false", style: `width: fit-content; min-width: 100%;` },
            clipboardTextSerializer: (slice) => slice.content.textBetween(0, slice.content.size, this._lineFeedType),
            handlePaste: (view, event) => this.handlePaste(view, event),
        });
        this._initialDoc = this._editView.state.doc;
        this.lineCount = this._editState.doc.childCount;
        this.renderLineNumbers();

        if(!success) return false;

        this.displayLineFeedType();
        this.displayEncoding();
        this.addLfTypeChangeHandler(() => this.switchLfType());
        this.addEncodingChangeHandler((encoding) => {
            this.switchEncoding(encoding);
        });
        return true;   
    }

    async reRender(){
        return await this.render(this._sourceFilePath);
    }

    async refresh(){
        const readSuccess = await this.readFile();
        if(!readSuccess) return null!;
        return this.setContentFromLines(this._lines);
    }

    getTextContent(){
        return this.getContentLines().join(this._lineFeedType);
    }
    
    private async createTempFile(){
        const fileExtension = StringUtils.GetFileExtension(this._sourceFilePath);
        const tempFileName = `temp${fileExtension}`;
        const tempFilePath = IpcUtils.joinPath(Data.appData.tempPath, tempFileName);
        this._tempFilePath = tempFilePath;
        const r = await IpcUtils.copyFile(this._sourceFilePath, tempFilePath,false);
        if(r.error)
            return false;
        return true;
    }

    protected async save(){
        return new Promise<boolean>(async (resolve) => {
            const func = () => {
                    this.executeSave().then((success) =>{
                        this.saveHandler?.(success);
                        if(success){
                            this._lastUpdated = new Date().toISOString();
                        }
                        resolve(success)
                    });
                };
            if(this._trackingChanges){
                this.onSyncWaitingCalls.push(func);
            }
            else if(this._untrackedChanges.length){
                this.onSyncWaitingCalls.push(func);
                this.trackChanges();
            }else{
                func();
            }
        });
        
    }

    private async executeSave(){
        if(this._tempFilePath && this._sourceFilePath){
            const r = await IpcUtils.copyFile(this._tempFilePath, this._sourceFilePath,true);
            if(r.error)
                return false;
            this._initialDoc = this._editView.state.doc;
            // Clear encoding stack on save
            const tr = this._editView.state.tr.setMeta(encodingStackKey, { type: 'pop' });
            tr.setMeta('addToHistory', false);
            // Pop all stack entries
            let stack = encodingStackKey.getState(this._editView.state) ?? [];
            let clearState = this._editView.state;
            while ((encodingStackKey.getState(clearState) ?? []).length > 0) {
                const clearTr = clearState.tr.setMeta(encodingStackKey, { type: 'pop' });
                clearTr.setMeta('addToHistory', false);
                clearState = clearState.apply(clearTr);
            }
            this._editView.updateState(clearState);
            return true;
        }
        return false;
    }

    destroy(){
        this._editView?.destroy();
        this._lineFeedType = undefined!;
        this.displayLineFeedType();
        this._encoding = undefined!
        this.displayEncoding();
    }

    protected abstract displayLineFeedType(): void;
    protected abstract displayEncoding(): void;
    protected abstract addLfTypeChangeHandler(callback:()=>void): void;
    protected abstract addEncodingChangeHandler(callback:(encoding: string)=>void): void;

}