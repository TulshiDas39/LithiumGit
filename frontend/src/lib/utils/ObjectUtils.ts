export class ObjectUtils{
    deepClone<T>(obj:T):T{
        console.log("obj",obj);
        return JSON.parse(JSON.stringify(obj));
    }
}