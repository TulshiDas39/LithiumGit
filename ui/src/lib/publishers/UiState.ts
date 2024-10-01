import { Publisher } from "./Publisher";

export abstract class UiState<T> extends Publisher<T>{
    constructor(value:T){
        super(value);
        this.subscribe(this.applyChange.bind(this));
    }
    protected abstract applyChange(): void;
}