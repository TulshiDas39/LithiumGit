import { DerivedPublisher } from "./DerivedPublisher";

export abstract class DerivedState<T> extends DerivedPublisher<T>{
    constructor(value:T){
        super(value);
        this.subscribe(this.applyChange.bind(this));
    }
    protected abstract applyChange(): void ;
}