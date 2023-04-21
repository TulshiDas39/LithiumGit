export class ObjectUtils{
    deepClone<T>(obj:T):T{
        return JSON.parse(JSON.stringify(obj));
    }
}