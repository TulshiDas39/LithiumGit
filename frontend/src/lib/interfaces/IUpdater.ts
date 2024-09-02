import { INotifiable } from "./INotifiable";

export interface IUpdater<T> extends INotifiable<T>{
    update:()=>void;
}