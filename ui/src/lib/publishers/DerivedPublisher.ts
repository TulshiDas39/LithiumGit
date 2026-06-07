import { Publisher } from "./Publisher";

export abstract class DerivedPublisher<T> extends Publisher<T>{    
    constructor(value?:T){
        super(value ?? null!);
        if(this._val == null || this._val == undefined)
            this._val = this.getDerivedValue();
    }

    protected abstract getDerivedValue():T;

    update(silent:boolean=false){
        const newValue = this.getDerivedValue();
        if(newValue == this.value)
            return;
        this.value = newValue;
        this.notifyAll(silent);
    }
}