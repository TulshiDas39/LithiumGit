import { EnumLinefeed, IChange, RendererEvents, StringUtils } from "common_library";
import { Data } from "../../data";
import {Schema, Node, Slice, Fragment} from "prosemirror-model"
import {EditorState, Transaction, Command} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {undo, redo, history} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {baseKeymap} from "prosemirror-commands"
import { ReplaceStep } from "prosemirror-transform";
import { IpcUtils } from "../IpcUtils";
import { RepoUtils } from "../RepoUtils";




export class TextEditor {
    protected _containerSelector:string = '';    
    protected _lines:string[] = [];
    protected _lineFeedType:EnumLinefeed = EnumLinefeed.LF;
    private _encoding:string = 'utf-8';
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


    constructor(containerSelector:string){
        this._containerSelector = containerSelector; 
        this._lineFeedType = Data.systemLineFeedType;    
        this._schema = this.getSchema();   
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
            IpcUtils.trackFileChanges(this._tempFilePath, this._untrackedChanges).then((result)=>{
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


    protected getPlugins(){
        return [history(),
            keymap({
                "Mod-z": undo,
                "Mod-y": redo,              
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
        this._lineFeedType = this._lineFeedType === EnumLinefeed.CRLF ? EnumLinefeed.LF : EnumLinefeed.CRLF;
        this._untrackedChanges.push({
            startlineIndex: 0,
            startOffset: 0,
            endlineIndex:0,
            endOffset:0,
            text: "",
        });
        await this.save();
    }

    getContentLines(): string[] {
        const lines: string[] = [];
        this._editView.state.doc.forEach(node => lines.push(node.textContent ?? ''));
        return lines;
    }

    protected async readFile(filePath:string){
        this._sourceFilePath = filePath;
        const r = await IpcUtils.getFileContentRaw(filePath);
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

    protected async render(){
        const success = await this.createTempFile();
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
        return true;   
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
            return true;
        }
        return false;
    }

    destroy(){
        console.log("Destroying editor");
        this._editView?.destroy();
    }

}