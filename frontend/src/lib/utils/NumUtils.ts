export class NumUtils{
    static between1_0(value:number){
        return Math.max(0,Math.min(1,value));
    }

    static between(min:number,max:number,value:number){
        if(value < min)
            return min;
        if(value > max)
            return max;
        return value;
    }
}