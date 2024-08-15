export class ArrayUtils{
    static findInReverse<T>(array:T[],key:keyof(T),value:T[keyof(T)]){
        for(let i = array.length-1; i>=0; i--){
            const item = array[i];
            if(item[key] === value){
                return item;
            }
        }
        return null;
    }

    static findMax(array:number[]){
        return array.reduce((acc,current) => Math.max(acc,current))
    }

    static findMin(array:number[]){
        return array.reduce((acc,current) => Math.min(acc,current))
    }
}