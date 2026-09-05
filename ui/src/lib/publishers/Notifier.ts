import { INotifiable } from "../interfaces";

export class Notifier<T> implements INotifiable<T>{
    protected _prevVal?:T;
    protected _val:T;
    protected events:((silent:boolean) => void)[]=[];
    private _defaultVal:T;
    constructor(value:T){
        this._val = value;
        this._defaultVal = value;
    }    
    get value(){
        return this._val;
    }

    protected set value(v:T){
        this._prevVal = this._val;
        this._val = v;
    }

    get prevValue(){
        return this._prevVal;
    }

    public notifyAll(silent:boolean=false){
        this.events.forEach(f => f(silent));
    }

    subscribe(callback: (silent:boolean) => void){
        if(!this.events.includes(callback))
            this.events.push(callback);
        return this;
    }
    unSubscribe(callback: (silent:boolean) => void) {
        this.events = this.events.filter( v =>  v != callback);
    }

    reset(){
        this._val = this._defaultVal;
        this.notifyAll(true);
    }
}