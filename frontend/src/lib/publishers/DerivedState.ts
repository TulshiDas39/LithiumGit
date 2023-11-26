import { IUiState } from "../interfaces";
import { DerivedPublisher } from "./DerivedPublisher";

export abstract class DerivedState<T> extends DerivedPublisher<T> implements IUiState{
    constructor(value:T){
        super(value);
        this.subscribe(this.applyChange.bind(this));
    }
    abstract applyChange(): void ;
}