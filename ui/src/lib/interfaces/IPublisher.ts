import { INotifiable } from "./INotifiable";

export interface IPublisher<T> extends INotifiable<T>{
    publish:(val:T)=>void;
}