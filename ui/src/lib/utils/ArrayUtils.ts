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
        if(!array.length)
            return 0;
        return array.reduce((acc,current) => Math.max(acc,current))
    }

    static findMin(array:number[]){
        if(!array.length)
            return 0;
        return array.reduce((acc,current) => Math.min(acc,current))
    }

    static findLastIndex<T>(arr:T[],cond:(x:T)=>boolean){
        for(let i = arr.length-1;i >= 0;i--){
            if(cond(arr[i]))
                return i;
        }
        return -1;
    }
}