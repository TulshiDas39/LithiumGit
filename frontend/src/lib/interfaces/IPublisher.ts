export interface IPublisher<T>{    
    subscribe:(callback:(val:T)=>void)=>void;
    unSubscribe:(callback:(val:T)=>void)=>void;
    publish:(val:T)=>void;    
}