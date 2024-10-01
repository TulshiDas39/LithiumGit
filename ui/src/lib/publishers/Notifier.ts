import { INotifiable } from "../interfaces";

export class Notifier<T> implements INotifiable<T>{
    protected _prevVal?:T;
    protected _val:T;
    protected events:((val: T) => void)[]=[];
    constructor(value:T){
        this._val = value;
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

    public notifyAll(){
        this.events.forEach(f => f(this._val));
    }

    subscribe(callback: (val: T) => void){
        if(!this.events.includes(callback))
            this.events.push(callback);
        return this;
    }
    unSubscribe(callback: (val: T) => void) {
        this.events = this.events.filter( v =>  v != callback);
    }
}