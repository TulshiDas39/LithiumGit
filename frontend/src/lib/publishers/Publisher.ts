import { IPublisher } from "../interfaces";

export class Publisher<T> implements IPublisher<T>{
    protected _prevVal?:T;
    protected _val:T;
    private events:((val: T) => void)[]=[];
    constructor(value:T){
        this._val = value;
    }
    get value(){
        return this._val;
    }

    get prevValue(){
        return this._prevVal;
    }
    subscribe(callback: (val: T) => void){
        if(!this.events.includes(callback))
            this.events.push(callback);
        return this;
    }
    unSubscribe(callback: (val: T) => void) {
        this.events = this.events.filter( v =>  v != callback);
    }
    publish(v:T){
        if(this._val == v)
            return;
        this._prevVal = this._val;
        this._val = v;
        this.events.forEach(f => f(this._val));
    }

}