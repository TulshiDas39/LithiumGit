import { IUiState } from "../interfaces";
import { Publisher } from "./Publisher";

export abstract class UiState<T> extends Publisher<T> implements IUiState{
    constructor(value:T){
        super(value);
        this.subscribe(this.applyChange.bind(this));
    }
    abstract applyChange(): void;
}