import { IPublisher } from "../interfaces";

export class Publisher<T> implements IPublisher<T>{
    private _val:T;
    private events:((val: T) => void)[]=[];
    constructor(value:T){
        this._val = value;
    }
    get value(){
        return this._val;
    }
    subscribe(callback: (val: T) => void){
        if(!this.events.includes(callback))
            this.events.push(callback);
    }
    unSubscribe(callback: (val: T) => void) {
        this.events = this.events.filter( v =>  v != callback);
    }
    publish(v:T){
        this._val = v;
        this.events.forEach(f => f(this._val));
    }

}