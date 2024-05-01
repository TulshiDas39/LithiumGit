export class NumUtils{
    static between1_0(value:number){
        return Math.max(0,Math.min(1,value));
    }

    static between(min:number,max:number,value:number){
        return Math.max(min,Math.min(max,value));        
    }

    static isBetween(min:number,max:number,value:number){
        if(value < min)
            return false;
        if(value > max)
            return false;
        return true;
    }

    static max(arr:number[]){
        if(!arr.length)
            return 0;
        let max = arr[0];
        for(let item of arr){
            if(item > max)
                max = item;
        }

        return max;
    }
}