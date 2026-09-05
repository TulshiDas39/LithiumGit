import { IPublisher } from "../interfaces";
import { Notifier } from "./Notifier";

export class Publisher<T> extends Notifier<T> implements IPublisher<T>{    
    constructor(value:T){
        super(value)
    } 

    publish(v:T,silent:boolean=false){
        if(this._val == v)
            return;
        this.value = v;
        this.notifyAll(silent);
    }
}