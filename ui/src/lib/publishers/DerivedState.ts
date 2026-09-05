import { DerivedPublisher } from "./DerivedPublisher";

export abstract class DerivedState<T> extends DerivedPublisher<T>{
    constructor(value:T){
        super(value);
        this.subscribe((silent:boolean)=>{
            if(silent)
                return;
            this.applyChange();
        });
    }
    protected abstract applyChange(): void ;
}