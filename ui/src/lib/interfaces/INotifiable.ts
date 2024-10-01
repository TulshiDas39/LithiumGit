export interface INotifiable<T>{
    subscribe:(callback:(val:T)=>void)=>void;
    unSubscribe:(callback:(val:T)=>void)=>void;
}